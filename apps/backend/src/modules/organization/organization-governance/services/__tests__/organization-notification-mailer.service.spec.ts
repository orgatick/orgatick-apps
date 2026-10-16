import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { ConfigService } from "@nestjs/config";
import type { MailService } from "../../../../../infrastructure/mail/mail.service";
import { OrganizationNotificationMailerService } from "../organization-notification-mailer.service";

interface SentHtmlCall {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  tags?: { name: string; value: string }[];
}

describe("Organization Notification Mailer Service", () => {
  const createMockService = (shouldFail = false) => {
    const sentCalls: SentHtmlCall[] = [];

    const mockMailService = {
      sendHtml: async (call: SentHtmlCall) => {
        if (shouldFail) {
          throw new Error("Mail provider unreachable");
        }
        sentCalls.push(call);
        return { messageId: "mock-msg-123" };
      },
    } as unknown as MailService;

    const mockConfigService = {
      get: (key: string) => {
        if (key === "ORGANIZATION_FROM_EMAIL") return "no-reply@orgatick.in";
        if (key === "ORGANIZATION_FROM_NAME") return "Orgatick";
        if (key === "ORGANIZATION_SUPPORT_EMAIL") return "support@orgatick.in";
        if (key === "ORGANIZER_APP_URL") return "https://organizer.orgatick.site";
        return null;
      },
    } as unknown as ConfigService;

    const service = new OrganizationNotificationMailerService(mockMailService, mockConfigService);

    return { service, sentCalls };
  };

  it("sends organization created notification with correct parameters", async () => {
    const { service, sentCalls } = createMockService();

    await service.sendOrganizationCreated({
      recipientEmail: "organizer@example.com",
      ownerName: "Alice Wonder",
      organizationName: "Wonder Events",
      organizationSlug: "wonder-events",
    });

    assert.equal(sentCalls.length, 1);
    const call = sentCalls[0];
    assert.equal(call.to, "organizer@example.com");
    assert.ok(call.subject.includes("Wonder Events"));
    assert.ok(call.html.includes("Wonder Events"));
    assert.ok(call.html.includes("Alice Wonder"));
    assert.equal(call.tags?.[0]?.value, "organization_created");
  });

  it("sends verification request received notification with correct parameters", async () => {
    const { service, sentCalls } = createMockService();

    await service.sendVerificationRequestReceived({
      recipientEmail: "organizer@example.com",
      ownerName: "Bob Builder",
      organizationName: "BuildFest Org",
      verificationReference: "VER-12345",
    });

    assert.equal(sentCalls.length, 1);
    const call = sentCalls[0];
    assert.equal(call.to, "organizer@example.com");
    assert.ok(call.subject.includes("Verification request received"));
    assert.ok(call.html.includes("BuildFest Org"));
    assert.ok(call.html.includes("VER-12345"));
    assert.equal(call.tags?.[0]?.value, "verification_requested");
  });

  it("sends verification approved notification with correct parameters", async () => {
    const { service, sentCalls } = createMockService();

    await service.sendVerificationApproved({
      recipientEmail: "organizer@example.com",
      ownerName: "Charlie Brown",
      organizationName: "Peanuts Live",
      organizationSlug: "peanuts-live",
      verifiedAt: "Oct 16, 2026",
    });

    assert.equal(sentCalls.length, 1);
    const call = sentCalls[0];
    assert.equal(call.to, "organizer@example.com");
    assert.ok(call.subject.includes("verified on Orgatick"));
    assert.ok(call.html.includes("Peanuts Live"));
    assert.equal(call.tags?.[0]?.value, "verification_approved");
  });

  it("sends verification rejected notification with reason", async () => {
    const { service, sentCalls } = createMockService();

    await service.sendVerificationRejected({
      recipientEmail: "organizer@example.com",
      ownerName: "David Miller",
      organizationName: "Miller Group",
      reason: "PAN card copy was blurry and unreadable.",
    });

    assert.equal(sentCalls.length, 1);
    const call = sentCalls[0];
    assert.equal(call.to, "organizer@example.com");
    assert.ok(call.subject.includes("Update on verification request"));
    assert.ok(call.html.includes("Miller Group"));
    assert.ok(call.html.includes("PAN card copy was blurry and unreadable."));
    assert.equal(call.tags?.[0]?.value, "verification_rejected");
  });

  it("handles email sending errors gracefully without throwing", async () => {
    const { service, sentCalls } = createMockService(true);

    // Should not throw even when mailService fails
    await assert.doesNotReject(async () => {
      await service.sendOrganizationCreated({
        recipientEmail: "error@example.com",
        ownerName: "Error Test",
        organizationName: "Fail Org",
        organizationSlug: "fail-org",
      });
    });

    assert.equal(sentCalls.length, 0);
  });
});
