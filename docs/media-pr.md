# Media & PR

Founder HQ → Media & PR (`/media-pr`). The route uses Founder HQ authentication and the existing workspace owner policy. The migration adds operational records and audit events in the same database. The dashboard accepts Press Ranger links, analytics references and uGotLeads IDs. It records attribution evidence manually; no CRM contact is copied or created.

For each company, use the same company and campaign names across records. Log earned editorial coverage and paid syndication as distinct campaigns. Record referral visits and leads for discrete date windows, using analytics and uGotLeads as the sources. Avoid importing overlapping cumulative totals. Confirm evidence before setting a record to Recorded.

The Press Ranger check is owner-initiated. It writes an audit event before authenticating to the vendor endpoint and looking up available capabilities. Install the vendor credential only as the server secret `SAGE_PRESS_RANGER_TOKEN`. Reuse the existing `FOUNDER_HQ_OWNER_UID` configuration. The check has no method for sending, publishing, purchasing, or mutating provider data. Sage workflow execution and automatic CRM or analytics sync require a verified company-specific provider mapping and approved tool contracts.

Deploy using the existing Founder HQ Lovable Cloud project. Verify its linked database reference before applying the migration. Smoke test with two owners, confirm records and audit events remain workspace-scoped, and check authenticated navigation, form persistence and the owner-only connection check.
