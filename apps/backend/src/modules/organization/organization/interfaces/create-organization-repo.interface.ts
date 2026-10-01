import type { CreateOrganization } from "@orgatick/contracts";

export default interface CreateOrganizationRepo {
  body: CreateOrganization;
  slug: string;
  userId: bigint;
  addressId?: bigint;
  logo: string | null;
  files?: Express.Multer.File[];
}
