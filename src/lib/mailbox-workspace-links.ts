// Explicit, human-verified mailbox-management links only.
//
// Founder HQ stores configuration; the live Namecheap connection lives in uGotLeads.
// A business with no entry here gets no link at all: never build a URL from a business
// name, workspace, email, or any other field, and never guess a tenant mapping.
const VERIFIED_MAILBOX_LINKS: Record<string, string> = {
  CleanMyTap: "https://app.ugotleads.io/sa/7EEuME2zYZSLui2b3BOX/dashboard/settings",
};

const ALLOWED_ORIGIN = "https://app.ugotleads.io";

export function mailboxLinkForBusiness(businessName: string): string | null {
  if (!Object.prototype.hasOwnProperty.call(VERIFIED_MAILBOX_LINKS, businessName)) return null;
  const url = VERIFIED_MAILBOX_LINKS[businessName];
  if (typeof url !== "string" || !url.startsWith(`${ALLOWED_ORIGIN}/`)) return null;
  return url;
}
