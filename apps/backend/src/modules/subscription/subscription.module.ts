import { Global, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrganizationMember } from "../organization/organization-member/entities/organization-member.entity";
import { Organization } from "../organization/organization/entities/organization.entity";
import { Role } from "../../common/authorization/entities/role.entity";
import { User } from "../users/entities/user.entity";
import {
  OrganizationEntitlementOverride,
  OrganizationSubscription,
  OrganizationSubscriptionItem,
  SubscriptionAddon,
  SubscriptionFeature,
  SubscriptionHistory,
  SubscriptionInvoice,
  SubscriptionInvoiceItem,
  SubscriptionLimitDefinition,
  SubscriptionPayment,
  SubscriptionPlan,
  SubscriptionPlanFeature,
  SubscriptionPlanLimit,
  SubscriptionPrice,
  SubscriptionUsageCounter,
  SubscriptionUsagePeriod,
} from "./entities";
import { SubscriptionEntitlementGuard, SubscriptionLimitGuard } from "./guards";
import {
  EntitlementCacheService,
  EntitlementService,
  SubscriptionCatalogService,
  SubscriptionLifecycleService,
  SubscriptionUsageService,
} from "./services";

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      SubscriptionPlan,
      SubscriptionFeature,
      SubscriptionLimitDefinition,
      SubscriptionPlanFeature,
      SubscriptionPlanLimit,
      SubscriptionPrice,
      SubscriptionAddon,
      OrganizationSubscription,
      OrganizationSubscriptionItem,
      OrganizationEntitlementOverride,
      SubscriptionHistory,
      SubscriptionUsageCounter,
      SubscriptionUsagePeriod,
      SubscriptionInvoice,
      SubscriptionInvoiceItem,
      SubscriptionPayment,
      Organization,
      OrganizationMember,
      Role,
      User,
    ]),
  ],
  providers: [
    EntitlementCacheService,
    SubscriptionCatalogService,
    SubscriptionUsageService,
    EntitlementService,
    SubscriptionLifecycleService,
    SubscriptionEntitlementGuard,
    SubscriptionLimitGuard,
  ],
  exports: [
    SubscriptionCatalogService,
    SubscriptionUsageService,
    EntitlementService,
    SubscriptionLifecycleService,
    SubscriptionEntitlementGuard,
    SubscriptionLimitGuard,
  ],
})
export class SubscriptionModule {}
