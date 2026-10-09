import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { PlatformRole } from "@/modules/users/enums/platform-role.enums";
import { OrganizationFinanceService } from "../finance.service";
import { AdminCommissionController } from "../../controllers/admin-commission.controller";
import { OrganizationCommissionController } from "../../controllers/organization-commission.controller";

describe("Organization Commission Settings", () => {
  const createMockContext = () => {
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
        currentCommission = {
          ...currentCommission,
          commissionPercentage: percentage.toFixed(2),
          updatedAt: new Date(),
        };
        return currentCommission;
      },
    };

    let orgExists = true;
    const mockOrgRepo = {
      findOne: async () => (orgExists ? { id: 100n, name: "Acme Corp" } : null),
    };

    const service = new OrganizationFinanceService(mockFinanceRepo as never, mockOrgRepo as never);

    const adminController = new AdminCommissionController(service);

    const mockMemberRepo = {
      findActiveMembership: async (orgId: bigint, userId: bigint) => {
        if (orgId === 100n && userId === 2n) {
          return { id: 10n, organizationId: orgId, userId };
        }
        return null;
      },
    };

    const orgController = new OrganizationCommissionController(service, mockMemberRepo as never);

    return {
      service,
      adminController,
      orgController,
      setOrgExists: (val: boolean) => {
        orgExists = val;
      },
    };
  };

  describe("OrganizationFinanceService", () => {
    it("returns active commission settings with numeric percentage", async () => {
      const { service } = createMockContext();
      const result = await service.getCommission(100n);
      assert.equal(result.organizationId, "100");
      assert.equal(result.commissionPercentage, 7);
    });

    it("throws NotFoundException if organization does not exist", async () => {
      const { service, setOrgExists } = createMockContext();
      setOrgExists(false);
      await assert.rejects(async () => {
        await service.getCommission(999n);
      }, NotFoundException);
    });

    it("updates commission percentage accurately", async () => {
      const { service } = createMockContext();
      const updated = await service.updateCommission(100n, 4.5);
      assert.equal(updated.commissionPercentage, 4.5);
    });
  });

  describe("AdminCommissionController", () => {
    it("allows admin to retrieve commission", async () => {
      const { adminController } = createMockContext();
      const result = await adminController.getCommission("100");
      assert.equal(result.commissionPercentage, 7);
    });

    it("allows admin to update commission", async () => {
      const { adminController } = createMockContext();
      const result = await adminController.updateCommission("100", { commissionPercentage: 5.25 });
      assert.equal(result.commissionPercentage, 5.25);
    });
  });

  describe("OrganizationCommissionController", () => {
    it("blocks non-members from viewing commission", async () => {
      const { orgController } = createMockContext();
      await assert.rejects(async () => {
        await orgController.getCommission({ user: { id: "999", role: PlatformRole.USER } } as never, "100");
      }, ForbiddenException);
    });

    it("allows active members to view commission", async () => {
      const { orgController } = createMockContext();
      const result = await orgController.getCommission({ user: { id: "2", role: PlatformRole.USER } } as never, "100");
      assert.equal(result.commissionPercentage, 7);
    });

    it("allows platform admins to view commission even without org membership", async () => {
      const { orgController } = createMockContext();
      const result = await orgController.getCommission(
        { user: { id: "999", role: PlatformRole.ADMIN } } as never,
        "100",
      );
      assert.equal(result.commissionPercentage, 7);
    });
  });
});
