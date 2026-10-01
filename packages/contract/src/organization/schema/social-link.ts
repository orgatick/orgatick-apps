import z from "zod";
import { OrganizationSocialPlatform } from "../enums";

export const OrganizationSocialLinkInputSchema = z.object({
  platform: z.enum(Object.values(OrganizationSocialPlatform), { message: "Invalid social platform" }),
  url: z.url("Must be a valid URL"),
});
