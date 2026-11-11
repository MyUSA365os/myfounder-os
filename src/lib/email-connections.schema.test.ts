import { describe, expect, test } from "bun:test";
import {
  businessInput,
  connectionInput,
  workspaceInput,
  publicConnection,
  MAILBOX_BACKEND,
  type EmailConnection,
} from "./email-connections.schema";

const workspaceId = "fbb6e57e-21cc-435a-b2f8-9ee341c79a75";
const businessId = "a1011000-9f75-4077-af3a-79eb451c4c58";
const configuration = {
  workspaceId,
  businessId,
  email: "smcqueen@cleanmytap.com",
  provider: "namecheap",
  imapHost: "mail.privateemail.com",
  imapPort: 993,
  imapTls: true,
  smtpHost: "mail.privateemail.com",
  smtpPort: 465,
  smtpTls: true,
};

describe("configuration-only mailbox boundary", () => {
  test("accepts the exact CleanMyTap Namecheap TLS configuration", () => {
    expect(connectionInput.parse(configuration)).toEqual(configuration);
  });
  test("rejects credentials rather than stripping them", () => {
    expect(
      connectionInput.safeParse({ ...configuration, password: "not-a-real-password" }).success,
    ).toBe(false);
  });
  test("rejects caller-supplied connected status and send fields", () => {
    expect(connectionInput.safeParse({ ...configuration, status: "connected" }).success).toBe(
      false,
    );
    expect(connectionInput.safeParse({ ...configuration, send: true }).success).toBe(false);
  });
  test("requires IMAP 993 with TLS", () => {
    expect(connectionInput.safeParse({ ...configuration, imapPort: 143 }).success).toBe(false);
    expect(connectionInput.safeParse({ ...configuration, imapTls: false }).success).toBe(false);
  });
  test("requires SMTP 465 with TLS", () => {
    expect(connectionInput.safeParse({ ...configuration, smtpPort: 25 }).success).toBe(false);
    expect(connectionInput.safeParse({ ...configuration, smtpTls: false }).success).toBe(false);
  });
  test("rejects a different host for Namecheap", () => {
    expect(
      connectionInput.safeParse({ ...configuration, imapHost: "other.example.com" }).success,
    ).toBe(false);
  });
  test("requires both workspace and business scope", () => {
    expect(connectionInput.safeParse({ ...configuration, workspaceId: undefined }).success).toBe(
      false,
    );
    expect(connectionInput.safeParse({ ...configuration, businessId: undefined }).success).toBe(
      false,
    );
    expect(workspaceInput.safeParse({ workspaceId, ownerId: "forged" }).success).toBe(false);
  });
  test("rejects business creation authorization overrides", () => {
    expect(
      businessInput.safeParse({ workspaceId, name: "CleanMyTap", ownerId: "forged" }).success,
    ).toBe(false);
  });
  test("safe output drops all unknown credential and content fields", () => {
    const row: EmailConnection & { password: string; body: string } = {
      id: businessId,
      workspace_id: workspaceId,
      business_id: businessId,
      email: configuration.email,
      provider: "namecheap",
      imap_host: configuration.imapHost,
      imap_port: 993,
      imap_tls: true,
      smtp_host: configuration.smtpHost,
      smtp_port: 465,
      smtp_tls: true,
      status: "needs_credentials",
      created_by: workspaceId,
      created_at: "2026-11-11T00:00:00Z",
      updated_at: "2026-11-11T00:00:00Z",
      password: "fake",
      body: "private",
    };
    const output = publicConnection(row);
    expect(Object.keys(output).sort()).toEqual(
      [
        "id",
        "workspace_id",
        "business_id",
        "email",
        "provider",
        "imap_host",
        "imap_port",
        "imap_tls",
        "smtp_host",
        "smtp_port",
        "smtp_tls",
        "status",
        "created_by",
        "created_at",
        "updated_at",
      ].sort(),
    );
    expect(output).not.toHaveProperty("password");
    expect(output).not.toHaveProperty("body");
  });
  test("credential, test, sync and send gates stay closed", () => {
    expect(MAILBOX_BACKEND).toEqual({
      credentialsReady: false,
      imapReady: false,
      smtpReady: false,
      syncReady: false,
      sendingEnabled: false,
      blocker: "Needs secure credential backend",
    });
  });
});
