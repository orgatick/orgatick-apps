import { Controller, Param, Post, Req } from "@nestjs/common";
import type { AuthRequest } from "../../../../common/types/auth-request.types";
import { OrganizationService } from "../services";

@Controller("organizations/:id/verification")
export class OrganizationVerificationController {
  constructor(private readonly organizationService: OrganizationService) {}

  /**
   * POST /organizations/:id/verification/request
   * Submits (or resubmits) the organization for platform verification review.
   * Kept on its own controller so it never shadows the public
   * `GET /organizations/:idOrSlug` route.
   */
  @Post("request")
  async request(@Req() req: AuthRequest, @Param("id") id: string) {
    return await this.organizationService.requestVerification(BigInt(id), {
      id: BigInt(req.user.id),
      name: req.user.name,
    });
  }
}
