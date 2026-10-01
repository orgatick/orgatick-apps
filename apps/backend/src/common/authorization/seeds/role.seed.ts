import { type DataSource, IsNull } from "typeorm";
import type { Seeder, SeederFactoryManager } from "typeorm-extension";
import { Organization } from "../../../modules/organization/organization/entities/organization.entity";
import { Permission } from "../entities/permission.entity";
import { RolePermission } from "../entities/role-permission.entity";
import { Role } from "../entities/role.entity";
import { DEFAULT_ROLES } from "../roles/default-roles";

/**
 * Seeds or updates the 4 predefined default roles with organizationId = null
 * and their associated permissions in authorization.role_permissions.
 */
export async function seedPredefinedRoles(dataSource: DataSource, permissionMap?: Map<string, bigint>): Promise<void> {
  const roleRepo = dataSource.getRepository(Role);
  const rolePermissionRepo = dataSource.getRepository(RolePermission);

  let resolvedPermissionMap = permissionMap;
  if (!resolvedPermissionMap) {
    const permissionRepo = dataSource.getRepository(Permission);
    const permissions = await permissionRepo.find({ where: { isActive: true } });
    resolvedPermissionMap = new Map<string, bigint>(permissions.map((p) => [p.key, BigInt(p.id)]));
  }

  for (const roleDef of DEFAULT_ROLES) {
    // 1. Find or create predefined role where organization_id IS NULL and key matches
    let role = await roleRepo.findOne({
      where: {
        organizationId: IsNull(),
        key: roleDef.key,
      },
    });

    if (!role) {
      role = await roleRepo.save(
        roleRepo.create({
          organizationId: null,
          key: roleDef.key,
          name: roleDef.name,
          description: roleDef.description,
          isActive: true,
        }),
      );
    } else {
      // Update mutable metadata if changed
      if (role.name !== roleDef.name || role.description !== roleDef.description) {
        await roleRepo.update({ id: role.id }, { name: roleDef.name, description: roleDef.description });
      }
    }

    // 2. Resolve target permission IDs
    const targetPermissionIds: bigint[] = [];
    for (const permKey of roleDef.permissions) {
      const permId = resolvedPermissionMap.get(permKey);
      if (permId) {
        targetPermissionIds.push(permId);
      }
    }

    // 3. Find existing role permissions to avoid duplicates
    const existingRolePermissions = await rolePermissionRepo.find({
      where: { roleId: role.id },
    });
    const existingPermissionIds = new Set(existingRolePermissions.map((rp) => rp.permissionId.toString()));

    // 4. Insert only missing role-permission mappings
    const toInsert = targetPermissionIds
      .filter((pid) => !existingPermissionIds.has(pid.toString()))
      .map((permissionId) => ({
        roleId: role.id,
        permissionId,
      }));

    if (toInsert.length > 0) {
      const chunkSize = 100;
      for (let i = 0; i < toInsert.length; i += chunkSize) {
        const chunk = toInsert.slice(i, i + chunkSize);
        await rolePermissionRepo.upsert(chunk, ["roleId", "permissionId"]);
      }
    }
  }
}

/**
 * Seeds or updates default roles and their associated permissions for a specific organization.
 * Reusable by organization onboarding and lifecycle services.
 */
export async function seedRolesForOrganization(
  dataSource: DataSource,
  organizationId: bigint,
  permissionMap?: Map<string, bigint>,
): Promise<void> {
  const roleRepo = dataSource.getRepository(Role);
  const rolePermissionRepo = dataSource.getRepository(RolePermission);

  let resolvedPermissionMap = permissionMap;
  if (!resolvedPermissionMap) {
    const permissionRepo = dataSource.getRepository(Permission);
    const permissions = await permissionRepo.find({ where: { isActive: true } });
    resolvedPermissionMap = new Map<string, bigint>(permissions.map((p) => [p.key, BigInt(p.id)]));
  }

  for (const roleDef of DEFAULT_ROLES) {
    let role = await roleRepo.findOne({
      where: {
        organizationId,
        key: roleDef.key,
      },
    });

    if (!role) {
      role = await roleRepo.save(
        roleRepo.create({
          organizationId,
          key: roleDef.key,
          name: roleDef.name,
          description: roleDef.description,
          isActive: true,
        }),
      );
    } else {
      if (role.name !== roleDef.name || role.description !== roleDef.description) {
        await roleRepo.update({ id: role.id }, { name: roleDef.name, description: roleDef.description });
      }
    }

    const targetPermissionIds: bigint[] = [];
    for (const permKey of roleDef.permissions) {
      const permId = resolvedPermissionMap.get(permKey);
      if (permId) {
        targetPermissionIds.push(permId);
      }
    }

    const existingRolePermissions = await rolePermissionRepo.find({
      where: { roleId: role.id },
    });
    const existingPermissionIds = new Set(existingRolePermissions.map((rp) => rp.permissionId.toString()));

    const toInsert = targetPermissionIds
      .filter((pid) => !existingPermissionIds.has(pid.toString()))
      .map((permissionId) => ({
        roleId: role.id,
        permissionId,
      }));

    if (toInsert.length > 0) {
      const chunkSize = 100;
      for (let i = 0; i < toInsert.length; i += chunkSize) {
        const chunk = toInsert.slice(i, i + chunkSize);
        await rolePermissionRepo.upsert(chunk, ["roleId", "permissionId"]);
      }
    }
  }
}

export default class RoleSeed implements Seeder {
  public async run(dataSource: DataSource, _factoryManager?: SeederFactoryManager): Promise<void> {
    const orgRepo = dataSource.getRepository(Organization);
    const permissionRepo = dataSource.getRepository(Permission);

    console.log("Loading active permissions for role assignment...");
    const permissions = await permissionRepo.find({ where: { isActive: true } });
    if (permissions.length === 0) {
      console.warn("No active permissions found in database. Run PermissionsSeeder before RoleSeed.");
      return;
    }

    const permissionMap = new Map<string, bigint>(permissions.map((p) => [p.key, BigInt(p.id)]));

    console.log("Seeding 4 predefined default roles (organizationId = null)...");
    await seedPredefinedRoles(dataSource, permissionMap);
    console.log("Successfully seeded 4 predefined default roles with organizationId = null.");

    console.log("Checking existing organizations for role seeding...");
    const organizations = await orgRepo.find({
      select: { id: true, name: true },
    });

    if (organizations.length > 0) {
      console.log(`Seeding roles for ${organizations.length} existing organization(s)...`);
      for (const org of organizations) {
        await seedRolesForOrganization(dataSource, BigInt(org.id), permissionMap);
      }
      console.log(`Successfully seeded roles for ${organizations.length} organization(s).`);
    }
  }
}
