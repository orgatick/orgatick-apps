"use client";

import { SocialLinksSection } from "./contacts/social-links-section";
import { SupportContactsSection } from "./contacts/support-contacts-section";

export function ContactsStep() {
  return (
    <div className="flex flex-col gap-8">
      <SocialLinksSection />
      <SupportContactsSection />
    </div>
  );
}
