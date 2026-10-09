import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { OrganizationBankAccountStatus, OrganizationBankAccountType } from "@orgatick/contracts";
import { OrganizationBankAccountService, maskAccountNumber } from "../bank-account.service";
import { OrganizationBankAccountController } from "../../controllers/organization-bank-account.controller";

describe("Organization Bank Account & Payout Details", () => {
  describe("maskAccountNumber helper", () => {
    it("masks all characters except last 4", () => {
      const { masked, last4 } = maskAccountNumber("123456789012");
      assert.equal(last4, "9012");
      assert.equal(masked, "••••••••9012");
    });

    it("handles short account numbers with fallback padding", () => {
      const { masked, last4 } = maskAccountNumber("1234");
      assert.equal(last4, "1234");
      assert.equal(masked, "••••1234");
    });
  });

  const createMockService = (overrides: { account?: Record<string, unknown> | null; orgExists?: boolean } = {}) => {
    let currentAccount: Record<string, unknown> | null = overrides.account ?? null;

    const mockBankAccountRepo = {
      findByOrganizationId: async (_orgId: bigint) => currentAccount,
      create: (data: Record<string, unknown>) => ({
        id: 1n,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data,
      }),
      save: async (entity: Record<string, unknown>) => {
        currentAccount = {
          ...currentAccount,
          ...entity,
          id: entity.id ?? 1n,
          createdAt: (currentAccount?.createdAt as Date) ?? new Date(),
          updatedAt: new Date(),
        };
        return currentAccount;
      },
    };

    const mockOrgRepo = {
      findOne: async () => (overrides.orgExists === false ? null : { id: 100n, name: "Acme Corp" }),
    };

    const service = new OrganizationBankAccountService(mockBankAccountRepo as never, mockOrgRepo as never);

    return { service, getCurrentAccount: () => currentAccount };
  };

  describe("getBankAccount", () => {
    it("returns null if organization has no bank account configured", async () => {
      const { service } = createMockService({ account: null });
      const res = await service.getBankAccount(100n);
      assert.equal(res, null);
    });

    it("returns masked account details when account exists", async () => {
      const { service } = createMockService({
        account: {
          id: 1n,
          organizationId: 100n,
          accountHolderName: "Acme Corp",
          accountNumber: "987654321098",
          ifscCode: "HDFC0001234",
          bankName: "HDFC Bank",
          branchName: "Koramangala",
          accountType: OrganizationBankAccountType.CURRENT,
          status: OrganizationBankAccountStatus.PENDING,
          verificationNotes: null,
          documentId: null,
          verifiedBy: null,
          verifiedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const res = await service.getBankAccount(100n);
      assert.ok(res);
      assert.equal(res.accountHolderName, "Acme Corp");
      assert.equal(res.bankName, "HDFC Bank");
      assert.equal(res.accountNumberLast4, "1098");
      assert.equal(res.accountNumberMasked, "••••••••1098");
      assert.equal(res.accountNumber, undefined); // raw number not leaked in regular view
      assert.equal(res.status, OrganizationBankAccountStatus.PENDING);
    });

    it("returns raw account number when includeRaw is true (for admin inspection)", async () => {
      const { service } = createMockService({
        account: {
          id: 1n,
          organizationId: 100n,
          accountHolderName: "Acme Corp",
          accountNumber: "987654321098",
          ifscCode: "HDFC0001234",
          bankName: "HDFC Bank",
          branchName: null,
          accountType: OrganizationBankAccountType.CURRENT,
          status: OrganizationBankAccountStatus.VERIFIED,
          verificationNotes: null,
          documentId: null,
          verifiedBy: null,
          verifiedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const res = await service.getBankAccount(100n, true);
      assert.ok(res);
      assert.equal(res.accountNumber, "987654321098");
      assert.equal(res.accountNumberMasked, "••••••••1098");
    });
  });

  describe("saveBankAccount", () => {
    it("creates a new bank account with PENDING status", async () => {
      const { service, getCurrentAccount } = createMockService({ account: null });
      const res = await service.saveBankAccount(
        100n,
        {
          accountHolderName: "Acme Corp",
          bankName: "State Bank of India",
          accountNumber: "123456789012",
          ifscCode: "sbiN0001234",
          branchName: "Main Branch",
          accountType: OrganizationBankAccountType.CURRENT,
        },
        50n,
      );

      assert.equal(res.accountHolderName, "Acme Corp");
      assert.equal(res.bankName, "State Bank of India");
      assert.equal(res.ifscCode, "SBIN0001234"); // auto-uppercased
      assert.equal(res.status, OrganizationBankAccountStatus.PENDING);
      assert.equal(getCurrentAccount()?.accountNumber, "123456789012");
    });

    it("resets VERIFIED status to PENDING if sensitive account details change", async () => {
      const { service, getCurrentAccount } = createMockService({
        account: {
          id: 1n,
          organizationId: 100n,
          accountHolderName: "Acme Corp",
          accountNumber: "111122223333",
          ifscCode: "HDFC0001234",
          bankName: "HDFC Bank",
          branchName: null,
          accountType: OrganizationBankAccountType.CURRENT,
          status: OrganizationBankAccountStatus.VERIFIED,
          verificationNotes: null,
          documentId: null,
          verifiedBy: 99n,
          verifiedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const res = await service.saveBankAccount(
        100n,
        {
          accountHolderName: "Acme Corp",
          bankName: "HDFC Bank",
          accountNumber: "999988887777", // changed account number
          ifscCode: "HDFC0001234",
          branchName: null,
          accountType: OrganizationBankAccountType.CURRENT,
        },
        50n,
      );

      assert.equal(res.status, OrganizationBankAccountStatus.PENDING);
      assert.equal(getCurrentAccount()?.verifiedAt, null);
      assert.equal(getCurrentAccount()?.verifiedBy, null);
    });

    it("throws NotFoundException if organization does not exist", async () => {
      const { service } = createMockService({ orgExists: false });
      await assert.rejects(
        () =>
          service.saveBankAccount(
            999n,
            {
              accountHolderName: "Ghost",
              bankName: "Ghost Bank",
              accountNumber: "1234567890",
              ifscCode: "GHOST001",
              accountType: OrganizationBankAccountType.CURRENT,
            },
            1n,
          ),
        NotFoundException,
      );
    });
  });

  describe("verifyBankAccount (Admin)", () => {
    it("approves bank details and marks status VERIFIED with timestamp", async () => {
      const { service, getCurrentAccount } = createMockService({
        account: {
          id: 1n,
          organizationId: 100n,
          accountHolderName: "Acme Corp",
          accountNumber: "1234567890",
          ifscCode: "HDFC0001234",
          bankName: "HDFC Bank",
          branchName: null,
          accountType: OrganizationBankAccountType.CURRENT,
          status: OrganizationBankAccountStatus.PENDING,
          verificationNotes: null,
          documentId: null,
          verifiedBy: null,
          verifiedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const res = await service.verifyBankAccount(
        100n,
        {
          status: OrganizationBankAccountStatus.VERIFIED,
        },
        42n,
      );

      assert.equal(res.status, OrganizationBankAccountStatus.VERIFIED);
      assert.equal(getCurrentAccount()?.verifiedBy, 42n);
      assert.ok(getCurrentAccount()?.verifiedAt instanceof Date);
    });

    it("rejects bank details with review notes", async () => {
      const { service, getCurrentAccount } = createMockService({
        account: {
          id: 1n,
          organizationId: 100n,
          accountHolderName: "Acme Corp",
          accountNumber: "1234567890",
          ifscCode: "HDFC0001234",
          bankName: "HDFC Bank",
          branchName: null,
          accountType: OrganizationBankAccountType.CURRENT,
          status: OrganizationBankAccountStatus.PENDING,
          verificationNotes: null,
          documentId: null,
          verifiedBy: null,
          verifiedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const res = await service.verifyBankAccount(
        100n,
        {
          status: OrganizationBankAccountStatus.REJECTED,
          verificationNotes: "Account holder name mismatch with tax record",
        },
        42n,
      );

      assert.equal(res.status, OrganizationBankAccountStatus.REJECTED);
      assert.equal(res.verificationNotes, "Account holder name mismatch with tax record");
      assert.equal(getCurrentAccount()?.verifiedAt, null);
    });
  });

  describe("Controller Authorization", () => {
    it("blocks non-members from viewing bank details", async () => {
      const mockMemberRepo = {
        findActiveMembership: async () => null,
      };
      const controller = new OrganizationBankAccountController({} as never, mockMemberRepo as never);

      await assert.rejects(
        () => controller.getBankAccount({ user: { id: "10", role: "user" } } as never, "100"),
        ForbiddenException,
      );
    });

    it("blocks regular members (non-owner/admin) from updating bank details", async () => {
      const mockMemberRepo = {
        findActiveMembership: async () => ({
          role: { key: "volunteer" },
        }),
      };
      const controller = new OrganizationBankAccountController({} as never, mockMemberRepo as never);

      await assert.rejects(
        () =>
          controller.saveBankAccount({ user: { id: "10", role: "user" } } as never, "100", {
            accountHolderName: "Acme",
            bankName: "HDFC",
            accountNumber: "12345678",
            ifscCode: "HDFC001",
            accountType: OrganizationBankAccountType.CURRENT,
          }),
        ForbiddenException,
      );
    });

    it("allows owner or admin to save bank details", async () => {
      let savedCalled = false;
      const mockService = {
        saveBankAccount: async () => {
          savedCalled = true;
          return { id: "1" };
        },
      };
      const mockMemberRepo = {
        findActiveMembership: async () => ({
          role: { key: "owner" },
        }),
      };
      const controller = new OrganizationBankAccountController(mockService as never, mockMemberRepo as never);

      const res = await controller.saveBankAccount({ user: { id: "10", role: "user" } } as never, "100", {
        accountHolderName: "Acme",
        bankName: "HDFC",
        accountNumber: "12345678",
        ifscCode: "HDFC001",
        accountType: OrganizationBankAccountType.CURRENT,
      });

      assert.equal(savedCalled, true);
      assert.ok(res);
    });
  });
});
