# Architecture rules
- Email Connections uses existing authenticated server functions and workspace ownership plus database RLS; business IDs never establish authorization on their own.
- Mailbox configuration stores no credentials or message content; credential entry, testing, sync and sending remain fail-closed until a verified secure mailbox adapter exists.
- Mailbox transport belongs behind a documented server-only adapter; use a proven IMAP engine rather than a hand-written parser, and never expose passwords to agents.
- Email audit events are database-generated, immutable to application users, and contain only identifiers, actor, timestamp and fixed action codes.