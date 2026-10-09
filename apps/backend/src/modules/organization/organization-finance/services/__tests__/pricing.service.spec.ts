import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ForbiddenException } from "@nestjs/common";
import { OrganizationPaymentAccountStatus, OrganizationBankAccountStatus } from "@orgatick/contracts";
import { PlatformRole } from "@/modules/users/enums/platform-role.enums";
import { PlatformAdminGuard } from "@/common/authorization/guards/platform-admin.guard";
import { OrganizationDocumentStatus } from "../../../organization/enums/organization-document-status.enum";
import { OrganizationDocumentType } from "../../../organization/enums/organization-document-type.enum";
import { OrganizationPricingService } from "../pricing.service";
import { OrganizationPricingController } from "../../controllers/organization-pricing.controller";

interface MockPricingSetting {
  organizationId: bigint;
  paidEventsEnabled: boolean;
  requireBankDetails: boolean;
  disabledReason: string | null;
  updatedBy: bigint | null;
  createdAt: Date;
  updatedAt: Date;
}

interface MockOrg {
  id: bigint;
  name: string;
  email: string;
  allowPaidEvents: boolean;
  creator: { id: bigint; name: string; email: string };
  members: unknown[];
}

interface MockSentEmail {
  recipientEmail: string;
  recipientName: string;
  organizationName: string;
  paidEventsEnabled: boolean;
  requireBankDetails: boolean;
  disabledReason?: string | null;
  updatedByName?: string | null;
}

describe("Organization Pricing Control & Paid Event Restrictions", () => {
  const createMockService = (
    overrides: {
      pricingSetting?: Partial<MockPricingSetting>;
      org?: Partial<MockOrg>;
      paymentAccount?: unknown;
      document?: unknown;
      bankAccount?: unknown;
    } = {},
  ) => {
    let currentSetting: MockPricingSetting = {
      organizationId: 100n,
      paidEventsEnabled: false,
      requireBankDetails: true,
      disabledReason: null,
      updatedBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides.pricingSetting,
    };

    const mockPricingRepo = {
      ensure: async () => currentSetting,
      findByOrganizationId: async () => currentSetting,
      save: async (entity: Partial<MockPricingSetting>) => {
        currentSetting = { ...currentSetting, ...entity };
        return currentSetting;
      },
    };

    let currentOrg: MockOrg = {
      id: 100n,
      name: "Acme Corp",
      email: "contact@acme.com",
      allowPaidEvents: false,
      creator: { id: 1n, name: "Owner User", email: "owner@acme.com" },
      members: [],
      ...overrides.org,
    };

    const mockOrgRepo = {
      findOne: async () => currentOrg,
      save: async (entity: Partial<MockOrg>) => {
        currentOrg = { ...currentOrg, ...entity };
        return currentOrg;
      },
    };

    const mockPaymentAccountRepo = {
      findOne: async () => overrides.paymentAccount ?? null,
    };

    const mockDocumentRepo = {
      findOne: async () => overrides.document ?? null,
    };

    const mockBankAccountRepo = {
      findOne: async () => (overrides as { bankAccount?: unknown }).bankAccount ?? null,
    };

    let currentCommission = {
      organizationId: 100n,
      commissionPercentage: "7.00",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockFinanceRepo = {
      ensure: async () => currentCommission,
      findByOrganizationId: async () => currentCommission,
      updateCommission: async (_orgId: bigint, percentage: number) => {
        currentCommission = { ...currentCommission, commissionPercentage: percentage.toFixed(2) };
        return currentCommission;
      },
    };

    const sentEmails: MockSentEmail[] = [];
    const mockMailer = {
      sendPricingUpdatedNotification: async (payload: MockSentEmail) => {
        sentEmails.push(payload);
      },
    };

    const service = new OrganizationPricingService(
      mockPricingRepo as never,
      mockFinanceRepo as never,
      mockOrgRepo as never,
      mockPaymentAccountRepo as never,
      mockDocumentRepo as never,
      mockBankAccountRepo as never,
      mockMailer as never,
    );

    return { service, mockPricingRepo, mockFinanceRepo, mockOrgRepo, sentEmails, getCurrentOrg: () => currentOrg };
  };

  describe("checkEligibility", () => {
    it("rejects eligibility when paid events are disabled by administration", async () => {
      const { service } = createMockService({
        pricingSetting: {
          organizationId: 100n,
          paidEventsEnabled: false,
          requireBankDetails: true,
          disabledReason: "KYC documents under review",
        },
      });

      const result = await service.checkEligibility(100n);
      assert.equal(result.eligibleForPaidEvents, false);
      assert.equal(result.paidEventsEnabled, false);
      assert.ok(result.reasons.includes("KYC documents under review"));
    });

    it("rejects eligibility when bank details are mandatory but neither account nor proof is verified", async () => {
      const { service } = createMockService({
        pricingSetting: {
          organizationId: 100n,
          paidEventsEnabled: true,
          requireBankDetails: true,
          disabledReason: null,
        },
        paymentAccount: null,
        document: null,
      });

      const result = await service.checkEligibility(100n);
      assert.equal(result.eligibleForPaidEvents, false);
      assert.equal(result.bankDetailsVerified, false);
      assert.ok(result.reasons.some((r) => r.includes("Organization must add and verify bank details")));
    });

    it("grants eligibility when paid events are enabled and active payment account exists", async () => {
      const { service } = createMockService({
        pricingSetting: {
          organizationId: 100n,
          paidEventsEnabled: true,
          requireBankDetails: true,
          disabledReason: null,
        },
        paymentAccount: {
          id: 1n,
          organizationId: 100n,
          provider: "bank",
          status: OrganizationPaymentAccountStatus.ACTIVE,
        },
      });

      const result = await service.checkEligibility(100n);
      assert.equal(result.eligibleForPaidEvents, true);
      assert.equal(result.bankDetailsVerified, true);
      assert.equal(result.reasons.length, 0);
    });

    it("grants eligibility when paid events are enabled and verified BANK_ACCOUNT document exists", async () => {
      const { service } = createMockService({
        pricingSetting: {
          organizationId: 100n,
          paidEventsEnabled: true,
          requireBankDetails: true,
          disabledReason: null,
        },
        document: {
          id: 2n,
          organizationId: 100n,
          type: OrganizationDocumentType.BANK_ACCOUNT,
          status: OrganizationDocumentStatus.VERIFIED,
        },
      });

      const result = await service.checkEligibility(100n);
      assert.equal(result.eligibleForPaidEvents, true);
      assert.equal(result.bankDetailsVerified, true);
      assert.equal(result.reasons.length, 0);
    });

    it("grants eligibility when paid events are enabled and verified OrganizationBankAccount exists", async () => {
      const { service } = createMockService({
        pricingSetting: {
          organizationId: 100n,
          paidEventsEnabled: true,
          requireBankDetails: true,
          disabledReason: null,
        },
        bankAccount: {
          id: 3n,
          organizationId: 100n,
          status: OrganizationBankAccountStatus.VERIFIED,
        },
      });

      const result = await service.checkEligibility(100n);
      assert.equal(result.eligibleForPaidEvents, true);
      assert.equal(result.bankDetailsVerified, true);
      assert.equal(result.reasons.length, 0);
    });

    it("grants eligibility when bank details requirement is optional even without bank details", async () => {
      const { service } = createMockService({
        pricingSetting: {
          organizationId: 100n,
          paidEventsEnabled: true,
          requireBankDetails: false,
          disabledReason: null,
        },
        paymentAccount: null,
        document: null,
      });

      const result = await service.checkEligibility(100n);
      assert.equal(result.eligibleForPaidEvents, true);
      assert.equal(result.bankDetailsVerified, false);
      assert.equal(result.reasons.length, 0);
    });
  });

  describe("validatePaidEventAllowed", () => {
    it("throws ForbiddenException when organization is not eligible", async () => {
      const { service } = createMockService({
        pricingSetting: {
          organizationId: 100n,
          paidEventsEnabled: false,
          requireBankDetails: true,
          disabledReason: "Suspended due to chargebacks",
        },
      });

      await assert.rejects(
        async () => {
          await service.validatePaidEventAllowed(100n);
        },
        (err: unknown) => {
          assert.ok(err instanceof ForbiddenException);
          assert.ok(err.message.includes("Suspended due to chargebacks"));
          return true;
        },
      );
    });

    it("passes without exception when organization is fully eligible", async () => {
      const { service } = createMockService({
        pricingSetting: {
          organizationId: 100n,
          paidEventsEnabled: true,
          requireBankDetails: false,
        },
      });

      await service.validatePaidEventAllowed(100n);
      assert.ok(true);
    });
  });

  describe("updatePricingSetting", () => {
    it("updates pricing settings, syncs allowPaidEvents on Organization, and notifies owner", async () => {
      const { service, sentEmails, getCurrentOrg } = createMockService({
        pricingSetting: {
          organizationId: 100n,
          paidEventsEnabled: false,
          requireBankDetails: true,
          disabledReason: null,
        },
      });

      const updated = await service.updatePricingSetting(
        100n,
        {
          paidEventsEnabled: true,
          requireBankDetails: true,
          disabledReason: null,
        },
        { id: 99n, name: "Admin Officer" },
      );

      assert.equal(updated.paidEventsEnabled, true);
      assert.equal(updated.requireBankDetails, true);
      assert.equal(getCurrentOrg().allowPaidEvents, true);

      assert.equal(sentEmails.length, 1);
      assert.equal(sentEmails[0].recipientEmail, "contact@acme.com");
      assert.equal(sentEmails[0].paidEventsEnabled, true);
      assert.equal(sentEmails[0].updatedByName, "Admin Officer");
    });
  });

  describe("Access Control & Security", () => {
    it("PlatformAdminGuard blocks non-admin users from admin pricing controls", () => {
      const guard = new PlatformAdminGuard();
      const mockUserContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { id: 10, role: PlatformRole.USER, name: "Normal User" },
          }),
        }),
      };

      assert.throws(
        () => guard.canActivate(mockUserContext as never),
        (err: unknown) => {
          assert.ok(err instanceof ForbiddenException);
          assert.equal(err.message, "Platform admin access required");
          return true;
        },
      );
    });

    it("PlatformAdminGuard grants access to platform ADMIN users", () => {
      const guard = new PlatformAdminGuard();
      const mockAdminContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { id: 1, role: PlatformRole.ADMIN, name: "Super Admin" },
          }),
        }),
      };

      const allowed = guard.canActivate(mockAdminContext as never);
      assert.equal(allowed, true);
    });

    it("OrganizationPricingController denies access to users who are not active members", async () => {
      const { service } = createMockService();
      const mockMemberRepo = {
        findActiveMembership: async () => null,
      };

      const controller = new OrganizationPricingController(service, mockMemberRepo as never);
      const mockReq = {
        user: { id: "50", role: PlatformRole.USER, name: "External User" },
      };

      await assert.rejects(
        async () => {
          await controller.getEligibility(mockReq as never, "100");
        },
        (err: unknown) => {
          assert.ok(err instanceof ForbiddenException);
          assert.equal(err.message, "You are not an active member of this organization");
          return true;
        },
      );
    });

    it("OrganizationPricingController permits active organization members", async () => {
      const { service } = createMockService({
        pricingSetting: {
          organizationId: 100n,
          paidEventsEnabled: true,
          requireBankDetails: false,
        },
      });
      const mockMemberRepo = {
        findActiveMembership: async () => ({
          id: 1n,
          organizationId: 100n,
          userId: 50n,
          status: "active",
        }),
      };

      const controller = new OrganizationPricingController(service, mockMemberRepo as never);
      const mockReq = {
        user: { id: "50", role: PlatformRole.USER, name: "Org Member" },
      };

      const result = await controller.getEligibility(mockReq as never, "100");
      assert.equal(result.organizationId, "100");
      assert.equal(result.eligibleForPaidEvents, true);
    });
  });
});
