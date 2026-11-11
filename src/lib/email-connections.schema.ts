import { z } from "zod";

export const workspaceInput = z.object({ workspaceId: z.string().uuid() }).strict();
export const businessInput = workspaceInput
  .extend({ name: z.string().trim().min(1).max(120) })
  .strict();
const hostname = z
  .string()
  .trim()
  .toLowerCase()
  .max(253)
  .regex(
    /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,63}$/,
    "Use a public mail server hostname",
  );
export const connectionInput = z
  .object({
    workspaceId: z.string().uuid(),
    businessId: z.string().uuid(),
    email: z.string().trim().toLowerCase().email().max(254),
    provider: z.enum(["namecheap", "manual"]),
    imapHost: hostname,
    imapPort: z.literal(993),
    imapTls: z.literal(true),
    smtpHost: hostname,
    smtpPort: z.literal(465),
    smtpTls: z.literal(true),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (
      data.provider === "namecheap" &&
      (data.imapHost !== "mail.privateemail.com" || data.smtpHost !== "mail.privateemail.com")
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Namecheap requires mail.privateemail.com",
      });
    }
  });

export const CONNECTION_STATUSES = [
  "Not connected",
  "Needs credentials",
  "Connection tested",
  "Sync active",
  "Needs attention",
] as const;
export const MAILBOX_BACKEND = {
  credentialsReady: false,
  imapReady: false,
  smtpReady: false,
  syncReady: false,
  sendingEnabled: false,
  blocker: "Needs secure credential backend",
} as const;

export type Business = { id: string; workspace_id: string; name: string; created_at: string };
export type EmailConnection = {
  id: string;
  workspace_id: string;
  business_id: string;
  email: string;
  provider: "namecheap" | "manual";
  imap_host: string;
  imap_port: number;
  imap_tls: boolean;
  smtp_host: string;
  smtp_port: number;
  smtp_tls: boolean;
  status: "not_connected" | "needs_credentials";
  created_by: string;
  created_at: string;
  updated_at: string;
};
export type EmailAudit = {
  id: string;
  workspace_id: string;
  business_id: string;
  connection_id: string | null;
  actor_id: string;
  action: string;
  created_at: string;
};

// Explicit public projection: never return a transport/vault object or spread a row.
export function publicConnection(row: EmailConnection): EmailConnection {
  return {
    id: row.id,
    workspace_id: row.workspace_id,
    business_id: row.business_id,
    email: row.email,
    provider: row.provider,
    imap_host: row.imap_host,
    imap_port: row.imap_port,
    imap_tls: row.imap_tls,
    smtp_host: row.smtp_host,
    smtp_port: row.smtp_port,
    smtp_tls: row.smtp_tls,
    status: row.status,
    created_by: row.created_by,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
