# Orgatick — Organization Management

## 1. Purpose

The Organization module manages the complete lifecycle of an organization on Orgatick, from creation and verification to member management, permissions, operations, suspension, and closure.

The system has two distinct perspectives:

### Platform Administration

Orgatick's internal administrators manage organizations from a platform-governance perspective.

Their responsibilities include:

- Organization verification
- Organization moderation
- Organization status management
- Ownership/dispute handling
- Compliance and investigation
- Platform-level restrictions
- Viewing organization activity

### Organization Management

Organization owners and authorized members manage the organization itself.

Their responsibilities include:

- Organization profile
- Members
- Invitations
- Roles and permissions
- Organization settings
- Organization operations
- Internal activity

---

# 2. Core Principles

## 2.1 One Organization System

There should be one Organization domain rather than separate systems for Admin and Organizer.

The difference is **access level and permissions**.

```text
                    ORGANIZATION
                         |
              +----------+----------+
              |                     |
       Platform Admin       Organization Members
              |                     |
        Governance          Organization Operations
```

---

## 2.2 Permission-Based Access

Orgatick already has permission management.

Therefore, functionality should be defined as **capabilities**, not hardcoded role behavior.

For example:

Instead of:

> Organization Admin can invite members.

Use:

> Permission: `organization.members.invite`

A role can then contain that permission.

This allows organizations to create their own role structures later without changing the functionality of the system.

---

# 3. Organization Lifecycle

The organization lifecycle should cover:

1. Creation
2. Initial setup
3. Verification
4. Active operation
5. Modification
6. Possible restriction
7. Suspension
8. Reinstatement
9. Archiving/closure

### High-level flow

```text
Create Organization
        ↓
Initial Setup
        ↓
Verification / Review
        ↓
Active Organization
        ↓
Normal Operations
        ↓
 ┌───────────────┐
 │               │
Restriction    Suspension
 │               │
 ↓               ↓
Normal        Review
Operation        ↓
             Reinstatement
```

---

# 4. Organizer / Organization-Side Functions

## 4.1 Create Organization

The user should be able to:

- Create an organization
- Provide organization name
- Select organization type/category
- Provide description
- Add organization logo
- Add organization cover image
- Set organization slug
- Provide contact information
- Add website/social links
- Provide location/address where applicable
- Provide required verification information
- Submit organization

### Result

The creator becomes the initial organization owner.

---

# 5. Organization Profile Management

Authorized members should be able to manage the public organization profile.

Functions:

- View organization profile
- Edit organization name
- Edit description
- Change logo
- Change cover image
- Change organization category/type
- Change contact information
- Change website
- Manage social links
- Manage organization location
- Manage public profile information
- Preview public organization profile

Certain sensitive fields may require additional permission or verification.

---

# 6. Organization Members

The organization should have a complete member-management system.

## 6.1 Member List

Functions:

- View members
- Search members
- Filter members
- View member details
- View member role
- View member permissions
- View membership status
- View date joined
- View last activity where appropriate

---

## 6.2 Add Member

Functions:

- Invite existing Orgatick user
- Invite someone using email
- Assign role during invitation
- Assign permissions through the role
- Add member directly where allowed
- Cancel pending invitation

---

## 6.3 Member Management

Authorized users should be able to:

- Change member role
- Change member permissions where supported
- Remove member
- Suspend member's organization access
- Restore member access
- View membership history
- View member activity

---

## 6.4 Ownership

Functions:

- View current owner
- Transfer organization ownership
- Confirm ownership transfer
- Cancel pending ownership transfer where applicable
- Handle ownership transfer after account changes

Ownership transfer should be treated as a sensitive operation.

---

# 7. Organization Invitation System

The invitation system should support both existing and non-existing Orgatick users.

## Existing User

```text
Invite
  ↓
Invitation Created
  ↓
User Notified
  ↓
User Accepts
  ↓
Organization Membership Created
```

## New User

```text
Invite Email
  ↓
Invitation Created
  ↓
Invitation Email
  ↓
User Creates Orgatick Account
  ↓
User Verifies Account
  ↓
User Accepts Invitation
  ↓
Organization Membership Created
```

The invitation should remain independent until accepted.

---

## Invitation Functions

- Send invitation
- Resend invitation
- Cancel invitation
- View pending invitations
- Accept invitation
- Reject invitation
- Expire invitation
- Handle expired invitation
- View invitation history

---

# 8. Roles and Permissions

Because Orgatick already has permission management, the organization system should integrate with it instead of creating a separate authorization mechanism.

## Organization Permission Areas

At minimum, permissions should cover:

### Organization

- View organization
- Edit organization
- Manage organization settings
- Archive organization
- Transfer ownership

### Members

- View members
- Invite members
- Manage members
- Remove members
- Manage member roles

### Roles

- View roles
- Create roles
- Edit roles
- Delete roles
- Assign roles

### Permissions

- View permissions
- Assign permissions
- Manage permission sets

### Invitations

- View invitations
- Send invitations
- Cancel invitations
- Manage invitations

### Verification

- View verification status
- Submit verification
- Update verification information
- Resubmit verification

### Events

Organization event permissions should connect to the existing Event system rather than being duplicated here.

For example:

- Create event
- Edit event
- Publish event
- Manage event
- Manage tickets
- Manage registrations
- Manage check-ins
- View analytics

---

# 9. Organization Roles

Roles should be configurable.

A default organization can initially provide roles such as:

- Owner
- Administrator
- Manager
- Member

However, these should simply represent **default permission bundles**.

The system should eventually allow:

```text
Organization
    ↓
Roles
    ↓
Permissions
```

Example:

```text
Event Manager
    ├── event.view
    ├── event.create
    ├── event.update
    ├── ticket.manage
    └── registration.view
```

This makes the system scalable for different organizations.

---

# 10. Organization Verification

Verification is a platform-level process involving both the organization and Orgatick Admin.

## Organizer Functions

- View verification status
- Start verification
- Submit verification information
- Upload required documents
- Update submitted information
- View review status
- View rejection/request-change reason
- Correct information
- Resubmit verification
- View verification history

---

# 11. Verification Status

The verification process should support states such as:

- Not Submitted
- Draft
- Submitted
- Under Review
- Changes Required
- Verified
- Rejected
- Suspended/Revoked

The exact status names can be finalized later.

---

# 12. Platform Admin — Organization Management

Platform Admin has a separate organization-management area.

## 12.1 Organization List

Admin should be able to:

- View all organizations
- Search organizations
- Filter organizations
- Filter by verification status
- Filter by organization status
- Filter by creation date
- Filter by activity
- Find organizations by owner
- Find organizations by identifier

---

# 13. Platform Admin — Organization Details

Admin should be able to inspect:

### Organization Information

- Organization profile
- Owner
- Creation date
- Status
- Verification status
- Organization category
- Contact information

### Members

- Member list
- Member count
- Organization roles
- Membership status
- Membership history

### Activity

- Organization activity
- Important actions
- Administrative actions
- Verification history
- Status changes

### Operations

- Events
- Registrations
- Tickets
- Check-ins
- Relevant financial/transaction information

### Reports

- Complaints
- Abuse reports
- Verification issues
- Other platform reports

---

# 14. Platform Admin — Verification Management

Admin functions:

- View verification queue
- Open verification request
- Review organization information
- Review submitted documents
- Request additional information
- Request changes
- Approve organization
- Reject organization
- Add rejection reason
- Reopen verification
- Revoke verification
- Request re-verification
- View verification history

---

# 15. Platform Admin — Organization Moderation

Admin should be able to take platform-level actions when necessary.

Functions:

- Restrict organization
- Suspend organization
- Unsuspend organization
- Restore organization
- Disable specific capabilities
- Remove restrictions
- Add moderation reason
- View moderation history

Examples of restrictions:

```text
Organization
 ├── Event creation disabled
 ├── New registrations disabled
 ├── Ticket sales disabled
 └── Invitations disabled
```

Restrictions should ideally be capability-based rather than requiring many different organization statuses.

---

# 16. Organization Suspension

Suspension should be different from normal organization management.

Possible reasons:

- Policy violation
- Fraud
- Abuse
- Verification issue
- Security concern
- Payment/compliance issue
- Legal request
- Repeated violations

Admin functions:

- Suspend organization
- Provide reason
- Set restriction scope
- Set suspension duration where applicable
- Notify organization
- Review suspension
- Unsuspend organization
- Record suspension history

Organization users should be able to:

- View suspension status
- View reason where appropriate
- View affected functionality
- Contact/support escalation path
- Submit required information
- Request review

---

# 17. Organization Reports / Complaints

The platform should support reports against organizations.

Functions:

### User/Platform Side

- Report organization
- Select report reason
- Provide description
- Submit evidence where applicable

### Admin Side

- View reports
- Investigate report
- View organization information
- View relevant activity
- Request information
- Resolve report
- Reject report
- Take moderation action
- Record resolution

---

# 18. Ownership Disputes

Because organizations can become important business entities, ownership disputes should have a dedicated flow.

Admin should be able to:

- View ownership dispute
- Review current owner
- Review organization history
- Review relevant members
- Review submitted evidence
- Freeze sensitive ownership operations
- Resolve ownership dispute
- Transfer ownership where justified
- Record decision

---

# 19. Organization Settings

Authorized organization members should be able to manage:

### General

- Organization information
- Branding
- Contact information
- Public profile

### Membership

- Membership settings
- Invitation settings
- Default member role

### Roles & Permissions

- Organization roles
- Permission assignments
- Custom roles

### Notifications

- Organization notifications
- Member notifications
- Event-related notifications

### Security

- Organization access
- Sensitive-action requirements
- Security activity

### Integrations

Where applicable:

- Payment integrations
- Communication integrations
- External services

---

# 20. Organization Activity

The organization should have an activity/history section.

Important activities include:

- Organization created
- Organization updated
- Member invited
- Invitation accepted
- Member removed
- Member role changed
- Permission changed
- Ownership transferred
- Verification submitted
- Verification approved
- Verification rejected
- Organization restricted
- Organization suspended
- Organization restored
- Organization archived

This should integrate with the existing audit-log system.

---

# 21. Organization Notifications

Organization members should receive notifications for important events.

Examples:

### Membership

- New invitation
- Invitation accepted
- Member removed
- Role changed
- Permission changed

### Verification

- Verification submitted
- Verification under review
- Additional information required
- Verification approved
- Verification rejected

### Moderation

- Organization restricted
- Organization suspended
- Organization restored

### Security

- Ownership transfer
- Sensitive organization changes
- Important permission changes

---

# 22. Organization Archiving / Closure

Organization closure should not immediately mean physical deletion.

Functions:

- Request organization archive
- Confirm archive
- Check active operations
- Archive organization
- Restore archived organization where allowed
- View archived organization
- Handle pending events/transactions
- Handle outstanding financial operations

Platform Admin should retain appropriate visibility after archival.

---

# 23. Platform Admin vs Organization Management

| Area                    | Organization        | Platform Admin           |
| ----------------------- | ------------------- | ------------------------ |
| Create organization     | Yes                 | Yes/Administrative       |
| Edit profile            | Yes                 | View / intervention      |
| Manage members          | Yes                 | View / intervention      |
| Manage roles            | Yes                 | Platform oversight       |
| Manage permissions      | Yes                 | Platform oversight       |
| Send invitations        | Yes                 | No                       |
| Verification submission | Yes                 | No                       |
| Verification review     | No                  | Yes                      |
| Approve verification    | No                  | Yes                      |
| Reject verification     | No                  | Yes                      |
| Organization moderation | Limited             | Yes                      |
| Suspend organization    | No                  | Yes                      |
| Unsuspend organization  | No                  | Yes                      |
| Ownership transfer      | Owner-controlled    | Exceptional admin action |
| Ownership dispute       | Submit/respond      | Resolve                  |
| View audit/activity     | Based on permission | Yes                      |
| Archive organization    | Based on permission | Administrative oversight |
| Reports/complaints      | Respond             | Investigate/manage       |

---

# 24. Main Organizer Flows

## Flow A — Create Organization

```text
User
 ↓
Create Organization
 ↓
Enter Organization Information
 ↓
Organization Created
 ↓
Creator becomes Owner
 ↓
Organization Setup
 ↓
Verification (if required)
 ↓
Organization Operational
```

---

## Flow B — Invite Member

```text
Authorized Member
 ↓
Invite Member
 ↓
Enter Email
 ↓
Select Role
 ↓
Send Invitation
 ↓
User Accepts
 ↓
Membership Created
 ↓
Permissions Applied
```

---

## Flow C — Manage Member

```text
Authorized Member
 ↓
Open Member
 ↓
View Membership
 ↓
Change Role / Permissions
        OR
Remove Member
        OR
Suspend Access
```

---

## Flow D — Verification

```text
Organization
 ↓
Submit Verification
 ↓
Admin Review
 ↓
 ┌───────────────┬─────────────────┐
 ↓               ↓                 ↓
Approved      Changes Required   Rejected
 ↓               ↓
Verified       Resubmit
```

---

## Flow E — Organization Moderation

```text
Admin
 ↓
Organization Review
 ↓
Issue Identified
 ↓
Restriction / Suspension
 ↓
Organization Notified
 ↓
Review / Resolution
 ↓
Restore
```

---

## Flow F — Ownership Transfer

```text
Current Owner
 ↓
Initiate Transfer
 ↓
Select New Owner
 ↓
Confirmation
 ↓
New Owner Accepts
 ↓
Ownership Transferred
 ↓
Roles/Permissions Updated
```

Sensitive ownership operations should have stronger confirmation/security requirements.

---

# 25. Functional Areas Checklist

The Organization module should ultimately contain these functional areas:

### Organization

- [ ] Create organization
- [ ] View organization
- [ ] Update organization
- [ ] Manage profile
- [ ] Manage branding
- [ ] Manage settings
- [ ] Archive organization

### Members

- [ ] List members
- [ ] Search members
- [ ] View member
- [ ] Add/invite member
- [ ] Change member role
- [ ] Manage member permissions
- [ ] Suspend member
- [ ] Remove member
- [ ] View membership history

### Invitations

- [ ] Send invitation
- [ ] Resend invitation
- [ ] Cancel invitation
- [ ] Accept invitation
- [ ] Reject invitation
- [ ] Expire invitation
- [ ] View invitation history

### Roles & Permissions

- [ ] View roles
- [ ] Create role
- [ ] Update role
- [ ] Delete role
- [ ] Assign role
- [ ] Manage permissions
- [ ] View effective permissions

### Verification

- [ ] Start verification
- [ ] Submit information
- [ ] Upload documents
- [ ] Track status
- [ ] Respond to changes
- [ ] Resubmit
- [ ] View verification history

### Platform Administration

- [ ] List organizations
- [ ] Search organizations
- [ ] Filter organizations
- [ ] View organization
- [ ] Review verification
- [ ] Approve verification
- [ ] Reject verification
- [ ] Request changes
- [ ] Revoke verification
- [ ] Suspend organization
- [ ] Unsuspend organization
- [ ] Apply restrictions
- [ ] Remove restrictions
- [ ] Investigate reports
- [ ] Resolve disputes
- [ ] Handle ownership disputes

### Activity & Audit

- [ ] Organization activity
- [ ] Membership activity
- [ ] Permission changes
- [ ] Verification history
- [ ] Moderation history
- [ ] Ownership history
- [ ] Administrative audit trail

### Notifications

- [ ] Invitation notifications
- [ ] Membership notifications
- [ ] Permission notifications
- [ ] Verification notifications
- [ ] Moderation notifications
- [ ] Security notifications

---

# 26. Recommended Implementation Order

For Orgatick, I would build this in the following order:

### Phase 1 — Foundation

1. Organization creation
2. Organization profile
3. Organization membership
4. Owner relationship
5. Organization permissions
6. Organization roles

### Phase 2 — Membership

7. Member management
8. Invitations
9. Existing/non-existing user invitation flow
10. Role assignment
11. Permission management

### Phase 3 — Platform Administration

12. Admin organization list
13. Admin organization details
14. Organization verification
15. Verification review
16. Verification history

### Phase 4 — Governance

17. Organization restrictions
18. Organization suspension
19. Organization reports
20. Ownership disputes
21. Ownership transfer

### Phase 5 — Supporting Systems

22. Organization activity
23. Audit integration
24. Notifications
25. Organization archival
26. Advanced settings

---

# 27. Important Boundary

The Organization module should **not absorb Event Management**.

Organization answers:

> Who owns and operates this organization, who has access, what can they do, and what is the organization's platform status?

Event Management answers:

> What events does this organization operate and how are those events managed?

Therefore:

```text
Organization
│
├── Identity
├── Members
├── Roles
├── Permissions
├── Invitations
├── Verification
├── Settings
├── Governance
└── Activity
       │
       └────────── Events
                    │
                    ├── Tickets
                    ├── Registrations
                    ├── Sessions
                    ├── Check-ins
                    └── Analytics
```

This boundary will keep your NestJS backend much cleaner as Orgatick grows.
