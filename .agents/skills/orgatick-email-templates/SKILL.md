ORGATICK Email Templates — AI Skill

1. Project Overview

This repository contains the email template system for ORGATICK.

ORGATICK is a modern platform being built with a modular backend architecture. This repository is responsible only for the presentation layer of transactional and system emails.

The goal of this repository is to provide:

- reusable React Email components
- consistent ORGATICK branding
- responsive email templates
- accessible email layouts
- maintainable template code
- templates that can be rendered by the backend email service
- a consistent experience across major email clients

AI agents are expected to create and modify email templates following the conventions defined in this document.

---

2. Primary Goal

When creating an email, prioritize:

1. Correctness
2. Clear communication
3. Brand consistency
4. Reusability
5. Accessibility
6. Email-client compatibility
7. Responsive behavior
8. Minimal unnecessary complexity

The email should look intentional and professional without becoming visually overloaded.

---

3. Technology

The project uses:

- React
- TypeScript
- React Email
- Node.js
- Email-safe HTML/CSS
- The ORGATICK backend email infrastructure

Templates should be implemented as React Email components rather than raw HTML.

Prefer React Email primitives such as:

- "Html"
- "Head"
- "Body"
- "Container"
- "Section"
- "Row"
- "Column"
- "Text"
- "Heading"
- "Link"
- "Button"
- "Img"
- "Hr"
- "Preview"

Do not introduce a new UI framework or CSS framework unless explicitly requested.

---

4. Email Categories

ORGATICK emails can generally be divided into the following categories.

Authentication

Examples:

- Email verification
- Welcome email
- Password reset
- Password changed
- New login notification
- Passkey registration
- Passkey authentication
- Security alert

Account

Examples:

- Profile changes
- Email address changed
- Account settings changed
- Organization invitation
- Organization membership changes

Commerce

Examples:

- Order confirmation
- Payment confirmation
- Payment failed
- Refund
- Invoice
- Shipment created
- Shipment dispatched
- Shipment delivered
- Delivery failed

System

Examples:

- Important system notifications
- Service notifications
- Maintenance notifications
- Action-required notifications

Marketing

Marketing emails may exist separately from transactional emails.

Marketing emails should not be mixed with security-critical transactional templates.

---

5. Design Philosophy

ORGATICK emails should feel:

- modern
- clean
- trustworthy
- lightweight
- professional
- easy to scan
- product-oriented

Avoid:

- excessive gradients
- excessive shadows
- huge decorative illustrations
- unnecessary animations
- overly rounded UI
- excessive colors
- dense paragraphs
- marketing-style language in security emails

The primary objective of a transactional email is to help the user understand what happened and what they need to do.

---

6. Visual Hierarchy

Every email should generally follow this hierarchy:

1. Brand/logo
2. Short title
3. Supporting explanation
4. Primary action
5. Additional information
6. Secondary/help information
7. Footer

Example:

ORGATICK

Verify your email address

Thanks for creating your account.
Please verify your email address to continue.

[ Verify Email ]

This link expires in 15 minutes.

If you didn't create this account, you can safely ignore this email.

© ORGATICK

Keep the main action obvious.

---

7. Layout

Use a centered email container with a constrained width.

Recommended desktop content width:

~580px - 600px

The email should remain readable on mobile devices.

Prefer:

Outer background (#f4f7fc)
    ↓
Email container (#ffffff, border: #c6ccd5 or #e7ecf3, rounded: 10px)
    ↓
Header (Logo: https://assets.orgatick.in/public/icons/icon-512.png)
    ↓
Main content (Text: #1a2b4c, Muted: #6c7480)
    ↓
CTA (Button background: #204b90, Text: #ffffff)
    ↓
Supporting content
    ↓
Footer

Avoid unnecessarily complicated nested layouts.

---

8. Responsive Design

Emails must work on:

- Gmail
- Outlook
- Apple Mail
- Yahoo Mail
- mobile email clients

Do not assume modern browser CSS support.

Prefer email-safe CSS and React Email primitives.

Avoid relying on:

- JavaScript
- complex CSS animations
- unsupported layout features
- external fonts as a requirement
- CSS that is known to have inconsistent Outlook support

Mobile readability is mandatory.

---

9. Typography

Typography should prioritize readability.

Use a safe system font stack unless the design system explicitly specifies another font.

Example:

font-family:
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  Roboto,
  Helvetica,
  Arial,
  sans-serif;

Use clear differences between:

- heading
- body
- supporting text
- metadata
- footer text

Do not use tiny text for important information.

---

10. Theme & Colors (Design System Tokens)

ORGATICK uses the following official design tokens across the application and email templates. Always adhere to these semantic color values.

### Light Theme (Default for Emails)
```css
--background: #f4f7fc;
--foreground: #1a2b4c;
--card: #ffffff;
--card-foreground: #1a2b4c;
--popover: #ffffff;
--popover-foreground: #1a2b4c;

--primary: #204b90;
--primary-foreground: #ffffff;

--secondary: #6355a4;
--secondary-foreground: #ffffff;

--accent: #5d82d9;
--accent-foreground: #ffffff;

--success: #2ecc71;
--warning: #f1c40f;
--info: #3498db;

--destructive: #d9534f;
--destructive-foreground: #ffffff;

--muted: #e7ecf3;
--muted-foreground: #6c7480;

--border: #c6ccd5;
--input: #d8dde6;
--ring: #2a56a5;

--chart-1: #1c458f;
--chart-2: #5f82d9;
--chart-3: #819ed0;
--chart-4: #476fb4;
--chart-5: #0f3475;

--sidebar: #f4f7fc;
--sidebar-foreground: #1a2b4c;
--sidebar-primary: #204b90;
--sidebar-primary-foreground: #ffffff;
--sidebar-accent: #e9eef8;
--sidebar-accent-foreground: #1a2b4c;
--sidebar-border: #c6ccd5;
--sidebar-ring: #2a56a5;

--radius: 10px;

--shadow-sm: 0 4px 6px rgba(0, 0, 0, 0.08);
--shadow: 0px 6px 10px rgba(0, 0, 0, 0.1);
```

### Dark Theme (Reference Tokens)
```css
--background: #090f1a;
--foreground: #eaf2ff;
--card: #0d141f;
--card-foreground: #ffffff;
--popover: #0d141f;
--popover-foreground: #ffffff;
--primary: #5d8ff4;
--primary-foreground: #000000;
--secondary: #8a7af2;
--secondary-foreground: #000000;
--accent: #3d5fb2;
--accent-foreground: #ffffff;
--success: #3ad578;
--warning: #f4c542;
--info: #58a6ff;
--destructive: #ff6b6b;
--destructive-foreground: #000000;
--muted: #1b2433;
--muted-foreground: #b6c1d6;
--border: #2c364a;
--input: #37435a;
--ring: #4d76d1;
```

### Tailwind Config Standard for ORGATICK Emails
When configuring `<Tailwind>` in React Email templates, extend the theme using:
```tsx
import { Tailwind, pixelBasedPreset } from 'react-email';

export const orgatickTailwindConfig = {
  presets: [pixelBasedPreset],
  theme: {
    extend: {
      colors: {
        background: '#f4f7fc',
        foreground: '#1a2b4c',
        card: '#ffffff',
        'card-foreground': '#1a2b4c',
        primary: {
          DEFAULT: '#204b90',
          foreground: '#ffffff',
          dark: '#1c458f',
          light: '#2a56a5',
        },
        secondary: {
          DEFAULT: '#6355a4',
          foreground: '#ffffff',
        },
        accent: {
          DEFAULT: '#5d82d9',
          foreground: '#ffffff',
          light: '#e9eef8',
        },
        success: '#2ecc71',
        warning: '#f1c40f',
        info: '#3498db',
        destructive: {
          DEFAULT: '#d9534f',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#e7ecf3',
          foreground: '#6c7480',
        },
        border: '#c6ccd5',
        input: '#d8dde6',
        ring: '#2a56a5',
      },
      borderRadius: {
        DEFAULT: '10px',
        lg: '10px',
      },
    },
  },
};
```

### Semantic Usage Guidelines:
- **Body Background**: `#f4f7fc` (`bg-background`)
- **Main Container**: `#ffffff` (`bg-card`), Border: `#c6ccd5` (`border-border`) or `#e7ecf3` (`border-muted`), Radius: `10px` (`rounded-[10px]`)
- **Headings & Primary Text**: `#1a2b4c` (`text-foreground`)
- **Secondary / Muted Text**: `#6c7480` (`text-muted-foreground`)
- **Primary CTA Button**: `#204b90` (`bg-primary`), Text: `#ffffff` (`text-primary-foreground`)
- **Accent Highlight / Badge**: `#e9eef8` (`bg-accent-light`), Text: `#204b90` (`text-primary`)
- **Dividers & Section Borders**: `#e7ecf3` (`border-muted`)
- **Success States**: `#2ecc71` (`text-success` / `bg-success`)
- **Warning States**: `#f1c40f` (`text-warning`)
- **Error / Destructive States**: `#d9534f` (`text-destructive`)

---

11. Components

Reusable components should be created for patterns that appear in multiple emails.

Examples:

EmailLayout
EmailHeader
EmailFooter
EmailButton
EmailHeading
EmailText
EmailCard
EmailDivider
EmailInfoRow
EmailAlert

Do not duplicate the same markup across multiple templates.

If a UI pattern appears more than once, consider extracting it into a reusable component.

---

12. Templates

Each template should have a clear responsibility.

Example:

src/templates/
├── auth/
│   ├── VerifyEmail.tsx
│   ├── Welcome.tsx
│   ├── ResetPassword.tsx
│   └── SecurityAlert.tsx
│
├── account/
│   ├── EmailChanged.tsx
│   └── OrganizationInvitation.tsx
│
├── commerce/
│   ├── OrderConfirmation.tsx
│   ├── PaymentFailed.tsx
│   └── RefundIssued.tsx
│
└── shipment/
    ├── ShipmentCreated.tsx
    ├── ShipmentDispatched.tsx
    └── ShipmentDelivered.tsx

Use PascalCase for React component/template names.

---

13. Template Data

Templates should receive typed data.

Example:

interface VerifyEmailEmailProps {
  userName?: string;
  verificationUrl: string;
  expiresInMinutes: number;
}

Avoid hardcoding dynamic values.

Never hardcode:

- user names
- URLs
- order IDs
- tracking IDs
- amounts
- dates
- organization names
- security codes

Dynamic values must be passed through props.

---

14. Security Emails

Security-related emails require additional care.

Examples:

- password reset
- email verification
- new login
- passkey registration
- account security changes

Security emails should:

- clearly explain the event
- clearly identify the action
- avoid unnecessary information
- provide the user with a safe next step
- never expose secrets unnecessarily

Never include:

- passwords
- private authentication credentials
- sensitive tokens in visible text
- internal database identifiers unless required

If a token/link is required, expose only what is necessary for the user action.

---

15. Links and CTAs

Primary CTAs should use a clear action verb.

Good:

Verify Email
Reset Password
View Order
Track Shipment
Complete Setup
Review Payment

Avoid vague CTAs:

Click Here
Learn More
Continue
Go

A CTA should communicate what happens when the user clicks it.

---

16. Email Copy

Copy should be:

- concise
- direct
- friendly
- professional
- easy to understand

Prefer:

«Your email address has been verified.»

Instead of:

«Congratulations! We are extremely excited to inform you that your email verification process has been successfully completed.»

Avoid unnecessary marketing language in transactional emails.

Do not use fake urgency.

Do not create claims that are not supported by the application.

---

17. Preview Text

Every important transactional email should define preview text.

Example:

<Preview>
  Verify your ORGATICK email address to finish setting up your account.
</Preview>

Preview text should complement the subject rather than simply repeating it.

---

18. Accessibility

Templates should be accessible.

Requirements:

- meaningful alt text for informative images
- decorative images should have appropriate empty alt text
- sufficient color contrast
- readable font sizes
- descriptive CTA text
- semantic structure where supported
- information should not rely solely on color

Never communicate an important state using color alone.

Bad:

Payment failed

shown only in red.

Better:

Payment failed

We couldn't process your payment.

with optional visual emphasis.

---

19. Images

Use images only when they provide meaningful value.

The logo may be used in the header:
- Official Icon URL: `https://assets.orgatick.in/public/icons/icon-512.png`

Avoid unnecessary images because they:

- increase email size
- may be blocked by email clients
- slow loading
- complicate responsive behavior

All important information must remain understandable if images fail to load.

---

20. Footer

The footer should be consistent across templates.

Depending on email type, it may contain:

- ORGATICK branding
- support information
- legal information
- copyright
- relevant links

Do not add marketing unsubscribe controls to purely transactional/security emails unless required by the application's email policy.

---

21. Naming

Use descriptive names.

Good:

VerifyEmail.tsx
ResetPassword.tsx
PaymentFailed.tsx
ShipmentDelivered.tsx
OrganizationInvitation.tsx

Avoid:

Email1.tsx
Template2.tsx
NewEmail.tsx
TestEmail.tsx

Component names should describe the event or purpose.

---

22. Code Quality

Follow:

- SOLID where applicable
- DRY
- KISS
- strong TypeScript typing
- single responsibility
- composition over duplication

Do not over-engineer simple email templates.

Prefer simple, readable components over large abstraction layers.

---

23. AI Generation Rules

When asked to create a new email template, the AI agent must:

Step 1 — Understand the event

Determine:

- what happened
- who receives the email
- why they receive it
- what action they need to take
- whether the email is transactional, security, commerce, or marketing

Step 2 — Determine required data

Identify all dynamic values.

Example:

userName
verificationUrl
expiration

Step 3 — Reuse existing components

Before creating new components, inspect existing components and reuse them whenever possible.

Step 4 — Follow existing design

The new email should look like it belongs to the same product.

Do not create an entirely new visual style for every template.

Step 5 — Implement

Create:

- typed props
- React Email component
- preview text
- responsive layout
- accessible content
- reusable components where appropriate

Step 6 — Review

Check:

- TypeScript errors
- missing props
- broken links
- mobile layout
- excessive content
- accessibility
- email-client compatibility
- consistency with existing templates

---

24. AI Must Inspect Before Creating

Before creating a new template, inspect:

existing templates
existing components
existing layouts
existing styles
package.json
README
design tokens

Do not blindly create a new implementation.

If an equivalent component already exists, reuse it.

If an existing template solves most of the same problem, follow its structure.

---

25. Don't Make Assumptions

The AI agent must not invent:

- ORGATICK product features
- URLs
- support email addresses
- legal claims
- pricing
- order information
- security policies
- expiration times
- user information

If required information is missing, use clearly named props/placeholders or ask for the missing information.

---

26. Backend Integration

These templates are presentation components.

The backend is responsible for:

- deciding when an email should be sent
- providing template data
- generating secure tokens
- generating URLs
- determining recipients
- sending the email
- handling delivery failures
- tracking email events where applicable

The React template should not contain business logic.

Bad:

if (user.isVerified) {
  // business decision
}

Prefer:

<VerifyEmailEmail
  userName={userName}
  verificationUrl={verificationUrl}
/>

The backend determines what email to send and what data it receives.

---

27. Template Contract

Every template should behave approximately like:

Backend
   ↓
Email Service
   ↓
Template Resolver
   ↓
React Email Template
   ↓
HTML
   ↓
SMTP / Email Provider
   ↓
Recipient

The template's responsibility ends at producing valid email markup.

---

28. Testing

New templates should be renderable independently.

At minimum verify:

- template renders without errors
- required props are supplied
- HTML is generated correctly
- links are valid
- mobile layout is reasonable
- images have appropriate alt text
- no accidental placeholder content remains

When possible, preview the generated email in an actual email client or email testing service.

---

29. Git / Changes

Keep changes focused.

A new email should normally contain:

template
+
required reusable component(s)
+
tests/preview if applicable

Do not modify unrelated templates while creating a new email.

Use clear commit messages such as:

feat(email): add email verification template
feat(email): add shipment delivered template
refactor(email): extract reusable alert component

---

30. Final AI Checklist

Before considering an email complete, verify:

- [ ] Correct email purpose
- [ ] Correct recipient context
- [ ] Typed props
- [ ] Dynamic values are props
- [ ] No business logic inside template
- [ ] Existing components reused
- [ ] ORGATICK visual style followed (Theme colors: primary `#204b90`, background `#f4f7fc`, text `#1a2b4c`, border `#c6ccd5` / `#e7ecf3`)
- [ ] Responsive layout
- [ ] Accessible content
- [ ] Preview text included
- [ ] Clear primary CTA
- [ ] No invented information
- [ ] No sensitive information exposed
- [ ] No unnecessary images
- [ ] Consistent footer
- [ ] TypeScript passes
- [ ] Template renders successfully

---

31. Core Principle

The AI agent should behave like a member of the ORGATICK frontend/email team.

Do not simply generate an attractive email.

Generate an email that is:

correct + maintainable + reusable + accessible + brand-consistent + compatible with the ORGATICK backend.
