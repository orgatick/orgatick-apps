import crypto from "node:crypto";
import { ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { normalizeEmail } from "../../../../common/utils/email.util";
import { User } from "../../../users/entities/user.entity";
import { Organization } from "../../organization/entities/organization.entity";
import type { OrganizationMember } from "../../organization-member/entities/organization-member.entity";
import { OrganizationMemberStatus } from "../../organization-member/enums/organization-member-status.enum";
import { OrganizationMemberRepository } from "../../organization-member/repositories/member.repository";
import type { OrganizationInvitation } from "../entities/organization-invitation.entity";
import { OrganizationInvitationStatus } from "../enums/organization-invitation-status.enum";
import { OrganizationInvitationRepository } from "../repositories/invitation.repository";
import { OrganizationInvitationMailerService } from "./organization-invitation-mailer.service";

const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export interface InvitationActor {
  id: bigint;
  name: string;
}

@Injectable()
export class OrganizationInvitationService {
  constructor(
    private readonly invitationRepository: OrganizationInvitationRepository,
    private readonly memberRepository: OrganizationMemberRepository,
    private readonly mailer: OrganizationInvitationMailerService,
  ) {}

  private async loadMember(organizationId: bigint, userId: bigint): Promise<OrganizationMember> {
    const member = await this.memberRepository.findOne({
      where: { organizationId, userId },
      relations: { user: true, role: true },
    });
    if (!member) {
      throw new NotFoundException("Organization member not found");
    }
    return member;
  }

  private hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  private generateToken(): { token: string; tokenHash: string } {
    const token = crypto.randomBytes(32).toString("hex");
    return { token, tokenHash: this.hashToken(token) };
  }

  private isExpired(invitation: OrganizationInvitation): boolean {
    return invitation.expiresAt.getTime() <= Date.now();
  }

  private requirePending(invitation: OrganizationInvitation): void {
    if (invitation.status === OrganizationInvitationStatus.PENDING && this.isExpired(invitation)) {
      invitation.status = OrganizationInvitationStatus.EXPIRED;
    }
    if (invitation.status !== OrganizationInvitationStatus.PENDING) {
      throw new ConflictException(`This invitation has already been ${invitation.status}`);
    }
  }

  private assertInvitationForUser(invitation: OrganizationInvitation, user: User): void {
    if (normalizeEmail(invitation.email) !== normalizeEmail(user.email)) {
      throw new ForbiddenException("This invitation was sent to a different email address");
    }
  }

  async list(organizationId: bigint, status?: OrganizationInvitationStatus): Promise<OrganizationInvitation[]> {
    return await this.invitationRepository.findByOrg(organizationId, status);
  }

  async getPendingInvitations(organizationId: bigint): Promise<OrganizationInvitation[]> {
    return await this.invitationRepository.findPendingByOrg(organizationId);
  }

  async create(
    organizationId: bigint,
    actor: InvitationActor,
    input: { email: string; role: string },
  ): Promise<OrganizationInvitation> {
    const email = normalizeEmail(input.email);

    const role = await this.memberRepository.findRoleByKey(organizationId, input.role);
    if (!role) {
      throw new NotFoundException(`Role "${input.role}" not found`);
    }

    const existingMember = await this.memberRepository.findActiveMemberByEmail(organizationId, email);
    if (existingMember) {
      throw new ConflictException("This person is already an active member of the organization");
    }

    const pendingInvitation = await this.invitationRepository.findPendingByEmail(organizationId, email);
    if (pendingInvitation) {
      throw new ConflictException("An invitation is already pending for this email. Resend or cancel it instead.");
    }

    const { token, tokenHash } = this.generateToken();
    const invitation = await this.invitationRepository.save(
      this.invitationRepository.create({
        organizationId,
        email,
        role: role.key,
        invitedBy: actor.id,
        tokenHash,
        status: OrganizationInvitationStatus.PENDING,
        expiresAt: new Date(Date.now() + INVITATION_TTL_MS),
      }),
    );

    const organization = await this.invitationRepository.manager.findOneBy(Organization, {
      id: organizationId,
    });
    await this.mailer.sendInvitation({
      email,
      inviterName: actor.name,
      organizationName: organization?.name ?? "an organization",
      organizationLogo: organization?.logo ?? null,
      role: role.name,
      token,
    });

    return (
      (await this.invitationRepository.findOne({
        where: { id: invitation.id },
        relations: { inviter: true },
      })) ?? invitation
    );
  }

  async resend(organizationId: bigint, invitationId: bigint): Promise<OrganizationInvitation> {
    const invitation = await this.invitationRepository.findOneBy({ id: invitationId, organizationId });
    if (!invitation) {
      throw new NotFoundException("Invitation not found");
    }
    this.requirePending(invitation);

    const { token, tokenHash } = this.generateToken();
    invitation.tokenHash = tokenHash;
    invitation.expiresAt = new Date(Date.now() + INVITATION_TTL_MS);
    await this.invitationRepository.save(invitation);

    const role = await this.memberRepository.findRoleByKey(organizationId, invitation.role);
    const inviter = await this.invitationRepository.manager.findOneBy(User, {
      id: Number(invitation.invitedBy),
    });
    const organization = await this.invitationRepository.manager.findOneBy(Organization, {
      id: organizationId,
    });
    await this.mailer.sendInvitation({
      email: invitation.email,
      inviterName: inviter?.name ?? "An organizer",
      organizationName: organization?.name ?? "an organization",
      organizationLogo: organization?.logo ?? null,
      role: role?.name ?? invitation.role,
      token,
    });

    return (
      (await this.invitationRepository.findOne({
        where: { id: invitation.id },
        relations: { inviter: true },
      })) ?? invitation
    );
  }

  async cancel(organizationId: bigint, invitationId: bigint): Promise<OrganizationInvitation> {
    const invitation = await this.invitationRepository.findOneBy({ id: invitationId, organizationId });
    if (!invitation) {
      throw new NotFoundException("Invitation not found");
    }
    this.requirePending(invitation);

    invitation.status = OrganizationInvitationStatus.CANCELLED;
    invitation.cancelledAt = new Date();
    await this.invitationRepository.save(invitation);

    return (
      (await this.invitationRepository.findOne({
        where: { id: invitation.id },
        relations: { inviter: true },
      })) ?? invitation
    );
  }

  async preview(token: string) {
    const invitation = await this.invitationRepository.findByTokenHash(this.hashToken(token));
    if (!invitation) {
      throw new NotFoundException("Invitation not found or has been revoked");
    }

    if (invitation.status === OrganizationInvitationStatus.PENDING && this.isExpired(invitation)) {
      invitation.status = OrganizationInvitationStatus.EXPIRED;
      await this.invitationRepository.save(invitation);
    }

    return {
      organization: {
        id: invitation.organization.id.toString(),
        name: invitation.organization.name,
        slug: invitation.organization.slug,
        logo: invitation.organization.logo ?? null,
      },
      email: invitation.email,
      role: invitation.role,
      status: invitation.status,
      expiresAt: invitation.expiresAt.toISOString(),
      inviterName: invitation.inviter?.name ?? null,
    };
  }

  async accept(token: string, user: User): Promise<OrganizationMember> {
    const invitation = await this.invitationRepository.findByTokenHash(this.hashToken(token));
    if (!invitation) {
      throw new NotFoundException("Invitation not found or has been revoked");
    }

    this.requirePending(invitation);
    this.assertInvitationForUser(invitation, user);

    const role = await this.memberRepository.findRoleByKey(invitation.organizationId, invitation.role);
    if (!role) {
      throw new NotFoundException(`Role "${invitation.role}" no longer exists. Ask for a new invitation.`);
    }

    const userId = BigInt(user.id);
    let member = await this.memberRepository.findByOrgAndUser(invitation.organizationId, userId);

    if (member?.status === OrganizationMemberStatus.ACTIVE) {
      throw new ConflictException("You are already an active member of this organization");
    }

    if (member) {
      member.roleId = role.id;
      member.status = OrganizationMemberStatus.ACTIVE;
      member.joinedAt = member.joinedAt ?? new Date();
      member = await this.memberRepository.save(member);
    } else {
      member = await this.memberRepository.save(
        this.memberRepository.create({
          organizationId: invitation.organizationId,
          userId,
          roleId: role.id,
          status: OrganizationMemberStatus.ACTIVE,
          joinedAt: new Date(),
        }),
      );
    }

    invitation.status = OrganizationInvitationStatus.ACCEPTED;
    invitation.acceptedAt = new Date();
    await this.invitationRepository.save(invitation);

    return await this.loadMember(invitation.organizationId, userId);
  }

  async reject(token: string, user: User): Promise<OrganizationInvitation> {
    const invitation = await this.invitationRepository.findByTokenHash(this.hashToken(token));
    if (!invitation) {
      throw new NotFoundException("Invitation not found or has been revoked");
    }

    this.requirePending(invitation);
    this.assertInvitationForUser(invitation, user);

    invitation.status = OrganizationInvitationStatus.REJECTED;
    invitation.rejectedAt = new Date();
    await this.invitationRepository.save(invitation);

    return invitation;
  }

  async getByTokenHash(tokenHash: string): Promise<OrganizationInvitation> {
    const invitation = await this.invitationRepository.findByTokenHash(tokenHash);
    if (!invitation) {
      throw new NotFoundException("Invitation not found");
    }
    return invitation;
  }
}
