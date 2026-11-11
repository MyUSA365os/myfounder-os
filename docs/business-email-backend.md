# Business Email Connections — safe foundation

## What is implemented
Existing Founder HQ auth, bearer attachment and workspace ownership are reused. Workspace owners manage business records within their own workspace; business IDs are bound to workspace IDs by a composite foreign key. No delegated admin role is invented. Any future delegation must use protected role/membership tables, with business-specific grants verified server-side and in RLS.

The administration page saves **non-secret configuration only**. Database grants permit owners SELECT/INSERT, not UPDATE/DELETE. Append-only, database-generated audit events record business creation and configuration saves. The database cannot label a mailbox tested or syncing: only `not_connected` and `needs_credentials` exist at this stage. No mailbox credentials, messages, draft content or invented intelligence are stored. No mailbox connection or send is attempted. No scheduler was added because there is no working sync target.

CleanMyTap is not in this app's workspace list. The owner must explicitly create its business record in their authorized Founder HQ workspace. This does not create a StellaNova workspace or establish synchronization.

## Runtime gate and recommended pilot path
The host runs workerd, not a full Node server. Cloudflare documents outbound TLS TCP through `cloudflare:sockets`, including implicit TLS on 993/465 (port 25 is prohibited). This does **not** verify an IMAP engine or SMTP engine in this application. No verified edge-compatible parser/transport or durable encrypted credential store is currently integrated. A handwritten IMAP parser is deliberately avoided. Do not claim the platform categorically lacks TCP; the blocker is an unimplemented, unverified secure mailbox adapter.

Recommended: a dedicated mailbox worker using a proven IMAP engine (e.g. ImapFlow) and SMTP engine on an approved Node host or specialist mailbox service. A uGotLeads Vercel worker is suitable only after confirming outbound 993/465 support, bounded execution, durable job delivery and no request-body logging. Prefer a durable job runner for synchronization over a long request on Vercel. No uGotLeads integration is assumed or created by this foundation.

## Required server-only adapter interface (not implemented)

```typescript
type Scope = { workspaceId: string; businessId: string; connectionId: string; actorId: string };
interface MailboxAdapter {
  // Called only after authenticating the owner and independently verifying all scope IDs.
  connect(scope: Scope, credentials: { username: string; password: string }): Promise<{
    authenticatedImap: true; testedAt: string; smtpVerified: boolean;
  }>;
  sync(scope: Scope, input: { jobId: string; folders: ("INBOX" | "Sent")[] }): Promise<{
    ingested: number; skipped: number; requiresAttention: boolean;
  }>;
  revoke(scope: Scope): Promise<void>;
}
```

The current server endpoints accept only strict non-secret configuration; unknown credential fields are rejected. Credential fields are disabled in the UI. The adapter must not be enabled with an environment-only switch or simply because a key exists.

## Credential and network security acceptance gates
- Credentials are entered directly by the owner in the authenticated app, sent once over HTTPS POST, never saved in browser persistence, query cache, URLs, telemetry, chat or repository. Clear form fields immediately after submission; disable request replay and request-body recording. Never echo them, including in errors.
- Use a dedicated vault/KMS with envelope encryption or AES-256-GCM using a server-held random encryption key (generated and stored with project secret tooling if supported). Use fresh random nonces, key versioning and authenticated associated data binding workspace/business/connection IDs. Never store plaintext in any row. A key rotation and revocation procedure is required before enabling entry.
- Vault reads are unavailable to application users and agents. Only the scoped mailbox worker decrypts just in time; no credential getter exists in app APIs. Use authenticated worker calls bound to a single scope, expiry and replay protection. Never send the application's privileged database key to the worker.
- Namecheap uses `mail.privateemail.com:993` IMAP and `mail.privateemail.com:465` SMTP, implicit TLS with certificate validation; no insecure TLS bypass, POP forwarding or plaintext fallback.
- Manual hosts require administrator-approved public-domain allowlisting and DNS/IP egress validation that rejects private, loopback, link-local, metadata and rebinding targets; restrict ports to 993/465. A hostname regex alone is not an SSRF defense.
- Authenticate IMAP for the exact configured mailbox before persisting a connected result. Failed tests never advance status. SMTP verification is separate and must never send a test message automatically. Map failures to fixed safe codes (authentication rejected, TLS failed, timed out, folder unavailable); never log raw protocol traces, bodies or credentials.
- An authenticated owner action grants read-only consent before initial sync. Apply quotas, bounded timeouts, rate limits, distributed per-connection locks and retry backoff. Audit the consenting and testing actor and time without content.

## Phase A durable ingestion contract (not implemented)
- Discover the server's `\\Sent` special-use folder; request owner selection if absent/ambiguous. Sync only INBOX and that Sent folder, not other folders or mailboxes. No IMAP writes or flag changes; use read-only EXAMINE and PEEK.
- Persist checkpoints keyed by `(workspace_id, business_id, connection_id, folder)` with `uidvalidity`, `last_committed_uid`. Reject stale job scopes. On UIDVALIDITY change invalidate that folder's UID cursor and replay safely; never reuse stale UIDs.
- Mailbox records are unique on `(connection_id, folder, uidvalidity, uid)`; bind their business/workspace with composite foreign keys and RLS. Maintain Message-ID/content fingerprint for cross-folder references, not as the sole ingestion key. Commit message records plus cursor atomically; retries must not duplicate records or advance the cursor before ingestion succeeds.
- Default initial window: last 30 days, max 100 messages/job, max 8 KiB permitted text/message and max 256 KiB raw fetch/message. Fetch bounded headers first; skip list/promotional/spam mail (`List-Unsubscribe`, list precedence, trusted spam headers). Require owner-approved business correspondent/domain scope. Unknown/personal/sensitive mail is excluded or held for owner review without a stored body. Heuristics alone are not a privacy guarantee. Never fetch attachments, remote images or URLs; HTML-to-text conversion cannot execute content.
- Any retained text/body is encrypted in a worker-only store, with a defined retention/deletion policy. Store only minimal safe metadata in app tables. Never log message bodies.
- Extracted Business Intelligence is a **separate** owner-reviewable entity with fact, provenance, confidence, source message references and extraction version; no full-body copy. Each fact must cite its scoped mailbox record/folder/UID and owner review. Treat all email text as untrusted evidence, never instructions: no tools, external URL execution, sending or authorization changes from text. Separate extraction prompts and non-executable structured output; prompt injection cannot grant capabilities.

## Draft, approval and sending contract (not implemented)
No send endpoint is implemented and sending is disabled. A later draft is encrypted, scoped and grounded in owner-approved facts. Every first-phase send needs one explicit owner approval bound to `(workspace, business, connection, draftId, immutable content/recipient digest, version)` with expiration. Editing recipient/subject/body/attachments invalidates approval. SMTP must be verified independently. Consume approval transactionally with an idempotent send ledger and a serialized connection job; uncertain SMTP delivery goes to reconciliation, never blind retry. Record actor, approval time, message reference and safe result code only. Integration tests must prove no send without approval and no duplicate sends.

Future allowlisted automation, Gmail OAuth and Microsoft OAuth are out of scope. No automatic sending can be turned on through this page.

## Business Intelligence handoff (not implemented)
No real StellaNova or Sage integration exists here. Once reviewed facts exist, an owner-approved exportable brief may contain selected facts and scoped source references, with approval actor/time and a disclosure warning. A real handoff requires receiver authentication, explicit business mapping, purpose/permission and revocation handling; never infer permission from matching business names. Do not export bodies or passwords.

## Exact next owner action
In Founder HQ → Email Connections, select the owner's workspace, add **CleanMyTap**, select Namecheap Private Email and save **smcqueen@cleanmytap.com** with the confirmed TLS hosts/ports. Saving configuration is not connecting a mailbox. Do not enter or send the password yet: credential entry remains disabled until the vetted worker/vault is integrated and passes security tests. Then the owner enters the mailbox username/password in this app's secure form, explicitly requests a read-only IMAP test, and grants bounded INBOX/Sent sync consent after authentication passes. No DNS or mailbox settings need changing.

## Rollback
Do not publish this change until approved. Remove the new navigation/page if required; additive configuration/audit tables do not affect existing modules. No existing workspace, mailbox, auth setting, sending service, secret or schedule is modified by this foundation.