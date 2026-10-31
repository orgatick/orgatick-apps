import { type MigrationInterface, type QueryRunner } from "typeorm";

export class SeedSubscriptionCatalogAndBackfill1792100500000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Seed Limit Definitions
    await queryRunner.query(`
      INSERT INTO "subscription"."subscription_limit_definitions"
        ("code", "name", "description", "limit_scope", "metric_type", "unit", "is_active")
      VALUES
        ('max_active_events', 'Maximum Active Events', 'Simultaneous published or live events', 'concurrent', 'gauge', 'count', true),
        ('max_team_members', 'Maximum Team Members', 'Active member seats in organization', 'concurrent', 'gauge', 'count', true),
        ('max_storage_bytes', 'Maximum Storage Space', 'Total R2 storage capacity in bytes', 'total', 'gauge', 'bytes', true),
        ('max_custom_roles', 'Maximum Custom Roles', 'Custom RBAC roles created for organization', 'total', 'gauge', 'count', true),
        ('max_monthly_api_requests', 'Monthly API Quota', 'Total API requests allowed per month', 'monthly_quota', 'counter', 'requests', true),
        ('analytics_retention_days', 'Analytics Retention Window', 'Historical analytics querying window in days', 'retention_window', 'time_interval', 'days', true)
      ON CONFLICT ("code") DO NOTHING;
    `);

    // 2. Seed Features
    await queryRunner.query(`
      INSERT INTO "subscription"."subscription_features"
        ("code", "name", "description", "category", "is_active")
      VALUES
        ('organization_management', 'Organization Management', 'Manage profile, social links, and contacts', 'governance', true),
        ('organization_verification', 'Organization Verification', 'KYC compliance verification workflow', 'governance', true),
        ('ticket_template_editor', 'Ticket Template Visual Editor', 'Customizable attendee badge and ticket designer', 'ticketing', true),
        ('custom_roles', 'Custom RBAC Roles', 'Define custom roles with granular permissions', 'governance', true),
        ('advanced_analytics', 'Advanced Analytics', 'Deep analytics reporting and cohort retention', 'analytics', true),
        ('custom_branding', 'Custom Organization Branding', 'Custom brand colors and white-labeling', 'branding', true),
        ('api_access', 'Developer API Access', 'Programmatic REST API keys and webhooks', 'developer', true),
        ('webhooks', 'Real-time Webhook Subscriptions', 'Webhook notifications for organization events', 'developer', true),
        ('audit_logs', 'Activity Audit Logging', 'Full audit trail of organizational events', 'governance', true),
        ('custom_domain', 'Custom Domain (CNAME)', 'Custom host domain for event listings', 'branding', true)
      ON CONFLICT ("code") DO NOTHING;
    `);

    // 3. Seed Subscription Plans
    await queryRunner.query(`
      INSERT INTO "subscription"."subscription_plans"
        ("code", "name", "description", "tier_level", "is_active", "is_public", "trial_period_days", "sort_order")
      VALUES
        ('free', 'Free Plan', 'Essential tools for campus clubs and student meetups', 0, true, true, 0, 1),
        ('starter', 'Starter Plan', 'Growing organizations hosting recurring professional events', 10, true, true, 14, 2),
        ('professional', 'Professional Plan', 'Advanced scale for conference and festival organizers', 20, true, true, 14, 3),
        ('enterprise', 'Enterprise Plan', 'Bespoke high-volume organizations with dedicated support', 30, true, true, 0, 4)
      ON CONFLICT ("code") DO NOTHING;
    `);

    // 4. Seed Plan Prices
    await queryRunner.query(`
      INSERT INTO "subscription"."subscription_prices"
        ("plan_id", "currency", "billing_interval", "price_in_minor_units", "is_active", "valid_from")
      SELECT id, 'INR', 'month', 99900, true, now() FROM "subscription"."subscription_plans" WHERE code = 'starter'
      UNION ALL
      SELECT id, 'INR', 'year', 999000, true, now() FROM "subscription"."subscription_plans" WHERE code = 'starter'
      UNION ALL
      SELECT id, 'INR', 'month', 299900, true, now() FROM "subscription"."subscription_plans" WHERE code = 'professional'
      UNION ALL
      SELECT id, 'INR', 'year', 2999000, true, now() FROM "subscription"."subscription_plans" WHERE code = 'professional'
      UNION ALL
      SELECT id, 'INR', 'month', 999900, true, now() FROM "subscription"."subscription_plans" WHERE code = 'enterprise'
      UNION ALL
      SELECT id, 'INR', 'year', 9999000, true, now() FROM "subscription"."subscription_plans" WHERE code = 'enterprise'
      ON CONFLICT DO NOTHING;
    `);

    // 5. Seed Plan Features
    await queryRunner.query(`
      INSERT INTO "subscription"."subscription_plan_features" ("plan_id", "feature_id", "is_included", "feature_level")
      -- FREE Plan
      SELECT p.id, f.id, true, 'basic' FROM "subscription"."subscription_plans" p, "subscription"."subscription_features" f
      WHERE p.code = 'free' AND f.code IN ('organization_management', 'organization_verification', 'ticket_template_editor')
      UNION ALL
      -- STARTER Plan
      SELECT p.id, f.id, true, CASE WHEN f.code = 'custom_branding' THEN 'basic' ELSE 'standard' END
      FROM "subscription"."subscription_plans" p, "subscription"."subscription_features" f
      WHERE p.code = 'starter' AND f.code IN ('organization_management', 'organization_verification', 'ticket_template_editor', 'custom_branding')
      UNION ALL
      -- PROFESSIONAL Plan
      SELECT p.id, f.id, true, CASE WHEN f.code IN ('custom_branding', 'advanced_analytics') THEN 'advanced' ELSE 'full' END
      FROM "subscription"."subscription_plans" p, "subscription"."subscription_features" f
      WHERE p.code = 'professional' AND f.code IN ('organization_management', 'organization_verification', 'ticket_template_editor', 'custom_roles', 'advanced_analytics', 'custom_branding', 'api_access', 'audit_logs')
      UNION ALL
      -- ENTERPRISE Plan
      SELECT p.id, f.id, true, 'custom' FROM "subscription"."subscription_plans" p, "subscription"."subscription_features" f
      WHERE p.code = 'enterprise'
      ON CONFLICT DO NOTHING;
    `);

    // 6. Seed Plan Limits
    await queryRunner.query(`
      INSERT INTO "subscription"."subscription_plan_limits" ("plan_id", "limit_def_id", "is_unlimited", "limit_value")
      -- FREE Plan
      SELECT p.id, l.id, false,
        CASE l.code
          WHEN 'max_active_events' THEN 1
          WHEN 'max_team_members' THEN 2
          WHEN 'max_storage_bytes' THEN 1073741824 -- 1 GB
          WHEN 'max_custom_roles' THEN 0
          WHEN 'max_monthly_api_requests' THEN 0
          WHEN 'analytics_retention_days' THEN 7
        END
      FROM "subscription"."subscription_plans" p, "subscription"."subscription_limit_definitions" l
      WHERE p.code = 'free'
      UNION ALL
      -- STARTER Plan
      SELECT p.id, l.id, false,
        CASE l.code
          WHEN 'max_active_events' THEN 3
          WHEN 'max_team_members' THEN 5
          WHEN 'max_storage_bytes' THEN 10737418240 -- 10 GB
          WHEN 'max_custom_roles' THEN 0
          WHEN 'max_monthly_api_requests' THEN 0
          WHEN 'analytics_retention_days' THEN 30
        END
      FROM "subscription"."subscription_plans" p, "subscription"."subscription_limit_definitions" l
      WHERE p.code = 'starter'
      UNION ALL
      -- PROFESSIONAL Plan
      SELECT p.id, l.id, false,
        CASE l.code
          WHEN 'max_active_events' THEN 10
          WHEN 'max_team_members' THEN 15
          WHEN 'max_storage_bytes' THEN 53687091200 -- 50 GB
          WHEN 'max_custom_roles' THEN 10
          WHEN 'max_monthly_api_requests' THEN 50000
          WHEN 'analytics_retention_days' THEN 365
        END
      FROM "subscription"."subscription_plans" p, "subscription"."subscription_limit_definitions" l
      WHERE p.code = 'professional'
      UNION ALL
      -- ENTERPRISE Plan
      SELECT p.id, l.id,
        CASE WHEN l.code = 'max_storage_bytes' THEN false ELSE true END,
        CASE WHEN l.code = 'max_storage_bytes' THEN 536870912000 ELSE NULL END -- 500 GB
      FROM "subscription"."subscription_plans" p, "subscription"."subscription_limit_definitions" l
      WHERE p.code = 'enterprise'
      ON CONFLICT DO NOTHING;
    `);

    // 7. Seed Add-ons
    await queryRunner.query(`
      INSERT INTO "subscription"."subscription_addons"
        ("code", "name", "description", "addon_type", "target_limit_def_id", "is_unlimited", "increase_value", "currency", "billing_interval", "price_in_minor_units", "is_active", "valid_from")
      SELECT 'addon_storage_50gb', 'Extra Storage (50 GB)', 'Add 50GB storage to your organization capacity', 'limit_increase', l.id, false, 53687091200, 'INR', 'month', 49900, true, now()
      FROM "subscription"."subscription_limit_definitions" l WHERE l.code = 'max_storage_bytes'
      UNION ALL
      SELECT 'addon_seats_5', 'Team Expansion (5 Seats)', 'Add 5 team member seats to your organization', 'limit_increase', l.id, false, 5, 'INR', 'month', 49900, true, now()
      FROM "subscription"."subscription_limit_definitions" l WHERE l.code = 'max_team_members'
      UNION ALL
      SELECT 'addon_active_events_2', 'Active Events Boost (+2)', 'Add 2 concurrent active events', 'limit_increase', l.id, false, 2, 'INR', 'month', 79900, true, now()
      FROM "subscription"."subscription_limit_definitions" l WHERE l.code = 'max_active_events'
      ON CONFLICT ("code") DO NOTHING;
    `);

    // 8. Backfill existing organizations with active FREE plan
    await queryRunner.query(`
      INSERT INTO "subscription"."organization_subscriptions"
        ("organization_id", "plan_id", "status", "billing_interval", "currency", "current_period_start", "current_period_end", "auto_renew")
      SELECT
        o.id,
        p.id,
        'active',
        'none',
        'INR',
        o.created_at,
        NULL,
        true
      FROM "organization"."organizations" o
      CROSS JOIN (SELECT id FROM "subscription"."subscription_plans" WHERE code = 'free') p
      WHERE NOT EXISTS (
        SELECT 1 FROM "subscription"."organization_subscriptions" os
        WHERE os.organization_id = o.id AND os.status IN ('active', 'trialing', 'past_due', 'grace_period')
      );
    `);

    // 9. Backfill continuous usage counters for existing organizations
    await queryRunner.query(`
      -- Team members counter
      INSERT INTO "subscription"."subscription_usage_counters" ("organization_id", "limit_def_id", "current_value", "last_recalculated_at")
      SELECT
        m.organization_id,
        l.id,
        COUNT(m.id),
        now()
      FROM "organization"."organization_members" m
      CROSS JOIN (SELECT id FROM "subscription"."subscription_limit_definitions" WHERE code = 'max_team_members') l
      WHERE m.status = 'active'
      GROUP BY m.organization_id, l.id
      ON CONFLICT ("organization_id", "limit_def_id") DO UPDATE
        SET current_value = EXCLUDED.current_value, last_recalculated_at = now();

      -- Custom roles counter
      INSERT INTO "subscription"."subscription_usage_counters" ("organization_id", "limit_def_id", "current_value", "last_recalculated_at")
      SELECT
        r.organization_id,
        l.id,
        COUNT(r.id),
        now()
      FROM "authorization"."roles" r
      CROSS JOIN (SELECT id FROM "subscription"."subscription_limit_definitions" WHERE code = 'max_custom_roles') l
      WHERE r.organization_id IS NOT NULL AND r.is_active = true
      GROUP BY r.organization_id, l.id
      ON CONFLICT ("organization_id", "limit_def_id") DO UPDATE
        SET current_value = EXCLUDED.current_value, last_recalculated_at = now();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "subscription"."subscription_usage_counters";`);
    await queryRunner.query(`DELETE FROM "subscription"."organization_subscriptions";`);
    await queryRunner.query(`DELETE FROM "subscription"."subscription_addons";`);
    await queryRunner.query(`DELETE FROM "subscription"."subscription_plan_limits";`);
    await queryRunner.query(`DELETE FROM "subscription"."subscription_plan_features";`);
    await queryRunner.query(`DELETE FROM "subscription"."subscription_prices";`);
    await queryRunner.query(`DELETE FROM "subscription"."subscription_plans";`);
    await queryRunner.query(`DELETE FROM "subscription"."subscription_features";`);
    await queryRunner.query(`DELETE FROM "subscription"."subscription_limit_definitions";`);
  }
}
