import assert from "node:assert/strict";
import { test } from "node:test";
import { inspectCapabilities, probePressRanger } from "./press-ranger.server";
import { summarizeMedia, type MediaRecord } from "./media-pr";

test("Press Ranger checks fail closed for other users and missing tokens", async () => {
  let auditCount = 0;
  const audit = async () => {
    auditCount += 1;
  };
  const tokens: string[] = [];
  const request = async (token: string) => {
    tokens.push(token);
  };
  assert.equal(
    await probePressRanger("other", { ownerUid: "owner", token: "secret" }, audit, request),
    "restricted",
  );
  assert.equal(
    await probePressRanger("owner", { ownerUid: "owner" }, audit, request),
    "unconfigured",
  );
  assert.equal(auditCount, 0);
  assert.equal(tokens.length, 0);
});

test("an audit must succeed before any call leaves the server", async () => {
  const tokens: string[] = [];
  const request = async (token: string) => {
    tokens.push(token);
  };
  const config = { ownerUid: "owner", token: "secret" };
  assert.equal(
    await probePressRanger(
      "owner",
      config,
      async () => {
        throw new Error("db");
      },
      request,
    ),
    "unavailable",
  );
  assert.equal(tokens.length, 0);
  let auditCount = 0;
  const audit = async () => {
    auditCount += 1;
  };
  assert.equal(await probePressRanger("owner", config, audit, request), "connected");
  assert.equal(auditCount, 1);
  assert.deepEqual(tokens, ["secret"]);
});

test("dashboard counts recorded events and sums attributed quantities", () => {
  const record: MediaRecord = {
    id: "id",
    workspace_id: "workspace",
    company: "MyUSA",
    campaign: "Founder",
    kind: "referral",
    title: "Visits",
    stage: "recorded",
    source_ref: null,
    quantity: 25,
    occurred_on: "2026-11-22",
    created_at: "2026-11-22",
  };
  const totals = summarizeMedia([
    record,
    { ...record, stage: "draft", quantity: 12 },
    { ...record, kind: "lead", quantity: 2 },
    { ...record, kind: "backlink", quantity: null },
    { ...record, kind: "response", stage: "archived", quantity: null },
  ]);
  assert.deepEqual([totals.referral, totals.lead, totals.backlink, totals.response], [25, 2, 1, 0]);
});

test("Press Ranger uses Worker-compatible manual redirects and never forwards credentials", async () => {
  const destinations: string[] = [];
  const request = async (url: RequestInfo | URL, init?: RequestInit) => {
    destinations.push(String(url));
    assert.equal(init?.redirect, "manual");
    return new Response(null, { status: 307, headers: { Location: "https://example.invalid" } });
  };
  const result = await probePressRanger(
    "owner",
    { ownerUid: "owner", token: "fixture" },
    async () => {},
    (token) => inspectCapabilities(token, request),
  );
  assert.equal(result, "Press Ranger initialization: HTTP 307.");
  assert.deepEqual(destinations, ["https://pressranger.com/mcp"]);
});
