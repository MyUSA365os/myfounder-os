import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readSageResearch } from "./sage-research.server";
import { projectSageResearch, researchContactRule } from "./sage-research.schema";

const settings = { ownerUid: "owner-unit", mainId: "main-unit", key: "unit-secret" };
const record = {
  prospectId: "prospect-1",
  businessName: "Acme Plumbing",
  category: "plumbing",
  website: "https://acme.invalid",
  city: "Austin",
  state: "TX",
  lifecycleStage: "research",
  verificationState: "unverified",
  researchPriorityScore: { value: 0, state: "known" },
  source: { type: "directory", externalId: "listing-1" },
  outreach: { status: "do_not_contact" },
};
const payload = (items: unknown[] = [record], subAccountId = settings.mainId) => ({
  data: { subAccountId, items, nextCursor: null },
});
const noFetch: typeof fetch = async () => {
  throw new Error("Unexpected transport");
};

describe("Founder-only click research", () => {
  for (const user of [undefined, "demo-unit", "admin-unit"]) {
    it(`denies ${user ?? "signed out"} before transport`, async () => {
      await assert.rejects(readSageResearch(user, settings, noFetch), /^Error: ACCESS_DENIED$/);
    });
  }
  it("fails closed without configured founder", async () => {
    await assert.rejects(
      readSageResearch(settings.ownerUid, { key: settings.key, mainId: settings.mainId }, noFetch),
      /ACCESS_DENIED/,
    );
  });
  for (const config of [
    { ownerUid: settings.ownerUid },
    { ownerUid: settings.ownerUid, key: settings.key },
    { ownerUid: settings.ownerUid, mainId: settings.mainId },
  ]) {
    it("reports missing research configuration without transport", async () => {
      assert.deepEqual(await readSageResearch(settings.ownerUid, config, noFetch), {
        configured: false,
      });
    });
  }
  it("makes exactly one server-owned no-store GET, never a write", async () => {
    let calls = 0;
    const original = AbortSignal.timeout;
    let timeout = 0;
    AbortSignal.timeout = (ms) => {
      timeout = ms;
      return original(ms);
    };
    try {
      const result = await readSageResearch(settings.ownerUid, settings, async (input, init) => {
        calls++;
        const url = new URL(String(input));
        assert.equal(url.origin, "https://app.ugotleads.io");
        assert.equal(url.pathname, "/api/agent/v1/prospects");
        assert.equal(url.searchParams.get("subAccountId"), "main-unit");
        assert.equal(url.searchParams.get("limit"), "10");
        assert.equal(init?.method, "GET");
        assert.equal(init?.cache, "no-store");
        assert.equal(init?.redirect, "manual");
        assert.equal(init?.body, undefined);
        assert.equal(new Headers(init?.headers).get("Authorization"), "Bearer unit-secret");
        assert.ok(init?.signal instanceof AbortSignal);
        return Response.json(payload());
      });
      assert.equal(calls, 1);
      assert.equal(timeout, 8000);
      assert.equal("available" in result && result.available, true);
      assert.equal(JSON.stringify(result).includes(settings.key), false);
    } finally {
      AbortSignal.timeout = original;
    }
  });
  for (const status of [201, 302, 401, 403, 404, 500]) {
    it(`sanitizes ${status} and does not retry`, async () => {
      let calls = 0;
      const result = await readSageResearch(settings.ownerUid, settings, async () => {
        calls++;
        return new Response("sensitive error", { status });
      });
      assert.equal(calls, 1);
      assert.deepEqual(result, { configured: true, available: false });
    });
  }
  it("sanitizes network errors", async () => {
    assert.deepEqual(await readSageResearch(settings.ownerUid, settings, noFetch), {
      configured: true,
      available: false,
    });
  });
  it("sanitizes wrong-tenant responses", async () => {
    assert.deepEqual(
      await readSageResearch(settings.ownerUid, settings, async () =>
        Response.json(payload([record], "client-tenant")),
      ),
      { configured: true, available: false },
    );
  });
});

describe("Business-safe research projection", () => {
  it("strips contact data, notes, raw source fields and cursors", () => {
    const result = projectSageResearch(
      payload([
        {
          ...record,
          email: "private@invalid.test",
          phone: "1234567890",
          notes: "private note",
          contacts: [{ name: "Private" }],
          source: { ...record.source, marketSlug: "private-market", runId: "private-run" },
          outreach: { ...record.outreach, email: "private@invalid.test" },
        },
      ]),
      settings.mainId,
    );
    assert.deepEqual(Object.keys(result), ["excludedCount", "items"]);
    assert.deepEqual(result.items[0]?.source, record.source);
    assert.equal(
      /private|contacts|notes|nextCursor|subAccountId/.test(JSON.stringify(result)),
      false,
    );
  });
  it("accepts legacy missing/null business fields while preserving numeric zero", () => {
    const result = projectSageResearch(
      payload([
        {
          prospectId: "legacy-1",
          businessName: null,
          category: null,
          website: null,
          city: null,
          state: null,
          source: null,
          outreach: null,
          lifecycleStage: null,
          verificationState: null,
          researchPriorityScore: { value: null, state: null },
        },
        record,
      ]),
      settings.mainId,
    );
    assert.equal(result.items[0]?.businessName, null);
    assert.equal(result.items[0]?.priority, null);
    assert.equal(result.items[0]?.source.type, null);
    assert.equal(result.items[1]?.priority, 0);
  });
  it("requires a machine-code prospect ID", () => {
    for (const prospectId of [null, "name@example.com", "Call this person", "<script>"]) {
      assert.throws(() =>
        projectSageResearch(payload([{ ...record, prospectId }]), settings.mainId),
      );
    }
    assert.throws(() => projectSageResearch(payload([{}]), settings.mainId));
  });
  it("rejects narrative and PII in codes/business slots", () => {
    for (const bad of [
      { lifecycleStage: "contact interested" },
      { businessName: "x@y.com" },
      { businessName: "x".repeat(121) },
      { category: "<script>" },
      { city: "123-456-7890" },
      { researchPriorityScore: { value: "high", state: "known" } },
    ]) {
      assert.throws(() => projectSageResearch(payload([{ ...record, ...bad }]), settings.mainId));
    }
  });
  it("rejects unsafe website URLs and documents", () => {
    for (const website of [
      "javascript:alert(1)",
      "data:text/html,bad",
      "file:///secret",
      "https://user:password@acme.invalid",
      "not a url",
      "https://acme.invalid?email=private",
      "https://acme.invalid/#secret",
    ]) {
      assert.throws(() => projectSageResearch(payload([{ ...record, website }]), settings.mainId));
    }
  });
  it("excludes explicit QA/synthetic/test/demo/example records and returns sample count", () => {
    const items = [
      record,
      ...["QA", "Synthetic", "Test", "Demo", "Example"].map((tag, i) => ({
        ...record,
        prospectId: `record-${i}`,
        businessName: `${tag} Plumbing`,
      })),
      { ...record, prospectId: "flagged-1", isQa: true },
    ];
    const result = projectSageResearch(payload(items), settings.mainId);
    assert.equal(result.excludedCount, 6);
    assert.deepEqual(
      result.items.map((item) => item.id),
      ["prospect-1"],
    );
  });
  it("keeps real names containing incidental test letters", () => {
    assert.equal(
      projectSageResearch(
        payload([{ ...record, businessName: "Testament Roofing" }]),
        settings.mainId,
      ).items.length,
      1,
    );
  });
  for (const status of [
    "suppressed",
    "do_not_contact",
    "DO-NOT-CONTACT",
    "dnc",
    "unsubscribed",
    "opt_out",
  ]) {
    it(`never suggests outreach for ${status}`, () => {
      assert.equal(researchContactRule(status), "DO NOT CONTACT");
    });
  }
  it("requires source/fit/consent review for unknown or ordinary status", () => {
    for (const status of [null, "new"])
      assert.equal(
        researchContactRule(status),
        "Owner should verify source, fit and consent before any contact.",
      );
  });
  it("rejects oversized or wrong-tenant envelopes and permits empty sample", () => {
    assert.throws(() => projectSageResearch(payload(Array(11).fill(record)), settings.mainId));
    assert.throws(() => projectSageResearch(payload([record], "wrong"), settings.mainId));
    assert.throws(() => projectSageResearch({ ...payload(), extra: "raw" }, settings.mainId));
    assert.deepEqual(projectSageResearch(payload([]), settings.mainId), {
      excludedCount: 0,
      items: [],
    });
  });
});
