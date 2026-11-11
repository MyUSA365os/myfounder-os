# Architecture rules
- Email Connections uses existing authenticated server functions and workspace ownership plus database RLS; business IDs never establish authorization on their own.
- Mailbox configuration stores no credentials or message content; credential entry, testing, sync and sending remain fail-closed until a verified secure mailbox adapter exists.
- Links out to an external mailbox manager come only from an explicit allowlist of human-verified business names; never derive or infer a URL from a business, workspace, or email field.
- Mailbox transport belongs behind a documented server-only adapter; use a proven IMAP engine rather than a hand-written parser, and never expose passwords to agents.
- Email audit events are database-generated, immutable to application users, and contain only identifiers, actor, timestamp and fixed action codes.
- Email administration queries run from the authenticated UI, not public loaders, and query keys include user and workspace IDs to prevent cached tenant data from crossing sessions.
- Keep Drizzle's blank schema placeholder and migration tooling because the managed migration runner requires them; do not add ORM models.