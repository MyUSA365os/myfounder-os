import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readWorkspaceEvidence } from "./workspace-evidence.server";
import { projectWorkspaceEvidence } from "./workspace-evidence.schema";
import { evidenceDate, evidenceNumber, evidenceKnownAmount } from "./workspace-evidence.display";

const settings = { ownerUid: "founder-test", key: "test-only-key", mainId: "main-test" };
function payload() {
  const time = "2026-11-21T17:34:00Z";
  return {
    data: {
      source: "ugotleads_operating_memory",
      scope: { subAccountId: "main-test" },
      sampling: { bounded: true, capPerCollection: 100, sampleLimited: true, noTotalClaims: true },
      runs: Array.from({ length: 12 }, (_, i) => ({
        id: `run-${i}`,
        workflowKey: "research",
        status: "waiting",
        currentStepKey: null,
        waitingReason: "approval_required",
        correlationId: "corr-test",
        createdAt: time,
        updatedAt: time,
        cost: null,
      })),
      humanActions: Array.from({ length: 12 }, (_, i) => ({
        id: `action-${i}`,
        actionType: "review",
        status: "pending",
        priority: "high",
        correlationId: "corr-test",
        workflowRunId: "run-0",
        createdAt: time,
      })),
    },
  };
}
const noFetch: typeof fetch = async () => {
  throw new Error("Transport must not run");
};

describe("Founder-only workspace evidence", () => {
  for (const user of [undefined, "demo-test", "admin-test"]) {
    it(`denies ${user ?? "signed-out"} before any request`, async () => {
      await assert.rejects(
        readWorkspaceEvidence(user, settings, noFetch),
        /^Error: ACCESS_DENIED$/,
      );
    });
  }
  it("denies all users if founder UID is absent", async () => {
    await assert.rejects(
      readWorkspaceEvidence(
        "founder-test",
        { key: settings.key, mainId: settings.mainId },
        noFetch,
      ),
      /ACCESS_DENIED/,
    );
  });
  for (const config of [
    { ownerUid: settings.ownerUid },
    { ownerUid: settings.ownerUid, key: settings.key },
    { ownerUid: settings.ownerUid, mainId: settings.mainId },
  ]) {
    it("returns unconfigured for founder when dedicated transport settings are incomplete", async () => {
      assert.deepEqual(await readWorkspaceEvidence(settings.ownerUid, config, noFetch), {
        configured: false,
      });
    });
  }
  it("uses an exact eight-second request timeout", async () => {
    const original = AbortSignal.timeout;
    let duration = 0;
    AbortSignal.timeout = (milliseconds) => {
      duration = milliseconds;
      return original(milliseconds);
    };
    try {
      await readWorkspaceEvidence(settings.ownerUid, settings, async () =>
        Response.json(payload()),
      );
      assert.equal(duration, 8000);
    } finally {
      AbortSignal.timeout = original;
    }
  });
  it("makes exactly one no-store GET with limit 10 and bounded timeout", async () => {
    let calls = 0;
    const transport: typeof fetch = async (input, init) => {
      calls++;
      const url = new URL(String(input));
      assert.equal(url.origin, "https://app.ugotleads.io");
      assert.equal(url.pathname, "/api/agent/v1/os/workspace-evidence");
      assert.equal(url.searchParams.get("subAccountId"), "main-test");
      assert.equal(url.searchParams.get("limit"), "10");
      assert.equal(init?.method, "GET");
      assert.equal(init?.cache, "no-store");
      assert.equal(init?.redirect, "manual");
      assert.equal(new Headers(init?.headers).get("Authorization"), "Bearer test-only-key");
      assert.ok(init?.signal instanceof AbortSignal);
      return Response.json(payload());
    };
    const result = await readWorkspaceEvidence(settings.ownerUid, settings, transport);
    assert.equal(calls, 1);
    assert.equal("available" in result && result.available, true);
    assert.equal(JSON.stringify(result).includes(settings.key), false);
  });
  for (const status of [201, 302, 401, 403, 404, 500]) {
    it(`sanitizes HTTP ${status} without retry`, async () => {
      let calls = 0;
      const result = await readWorkspaceEvidence(settings.ownerUid, settings, async () => {
        calls++;
        return new Response("sensitive", { status });
      });
      assert.deepEqual(result, {
        configured: true,
        available: false,
        reason: status === 404 ? "pending_release" : "unavailable",
      });
      assert.equal(calls, 1);
    });
  }
  it("sanitizes timeout and transport exceptions", async () => {
    assert.deepEqual(
      await readWorkspaceEvidence(settings.ownerUid, settings, async () => {
        throw new Error("secret URL and token");
      }),
      { configured: true, available: false, reason: "unavailable" },
    );
  });
  it("rejects a different tenant scope", async () => {
    const body = payload();
    body.data.scope.subAccountId = "cleanmytap-test";
    assert.deepEqual(
      await readWorkspaceEvidence(settings.ownerUid, settings, async () => Response.json(body)),
      { configured: true, available: false, reason: "unavailable" },
    );
  });
  it("caps both collections to 10", () => {
    const result = projectWorkspaceEvidence(payload(), settings.mainId);
    assert.equal(result.runs.length, 10);
    assert.equal(result.humanActions.length, 10);
    assert.equal(JSON.stringify(result).includes("private"), false);
    assert.equal(result.runs[0]?.cost, null);
  });
  it("rejects malformed sampling, costs, dates, and narrative codes", () => {
    const base = payload();
    assert.throws(() =>
      projectWorkspaceEvidence(
        { data: { ...base.data, sampling: { ...base.data.sampling, noTotalClaims: false } } },
        settings.mainId,
      ),
    );
    for (const override of [
      { cost: { aiKnownMicrocents: -1 } },
      { createdAt: "invalid" },
      { waitingReason: "Contact this person now" },
    ]) {
      assert.throws(() =>
        projectWorkspaceEvidence(
          { data: { ...base.data, runs: [{ ...base.data.runs[0], ...override }] } },
          settings.mainId,
        ),
      );
    }
  });
  it("preserves known microcents and unknown run counts separately", () => {
    const base = payload();
    const cost = {
      aiKnownMicrocents: 1200,
      aiUnknownRuns: 2,
      capabilityKnownMicrocents: 3400,
      capabilityUnknownRuns: 3,
    };
    const result = projectWorkspaceEvidence(
      { data: { ...base.data, runs: [{ ...base.data.runs[0], cost }] } },
      settings.mainId,
    );
    assert.deepEqual(result.runs[0]?.cost, cost);
  });
  it("accepts all contract-permitted nulls and partially known costs without dropping rows", async () => {
    const base = payload();
    const nullRun = {
      id: "historical-run",
      workflowKey: null,
      status: null,
      currentStepKey: null,
      waitingReason: null,
      correlationId: null,
      createdAt: null,
      updatedAt: null,
      cost: null,
    };
    const nullAction = {
      id: "historical-action",
      actionType: null,
      status: null,
      priority: null,
      correlationId: null,
      workflowRunId: null,
      createdAt: null,
    };
    const partialCost = {
      aiKnownMicrocents: null,
      aiUnknownRuns: 2,
      capabilityKnownMicrocents: 0,
      capabilityUnknownRuns: null,
    };
    const body = {
      data: {
        ...base.data,
        runs: [
          nullRun,
          { ...nullRun, id: "partial-run", cost: partialCost },
          {
            ...nullRun,
            id: "null-cost-fields",
            cost: {
              aiKnownMicrocents: null,
              aiUnknownRuns: null,
              capabilityKnownMicrocents: null,
              capabilityUnknownRuns: null,
            },
          },
        ],
        humanActions: [nullAction],
      },
    };
    const projected = projectWorkspaceEvidence(body, settings.mainId);
    assert.equal(projected.runs.length, 3);
    assert.deepEqual(projected.runs[0], nullRun);
    assert.deepEqual(projected.runs[1]?.cost, partialCost);
    assert.deepEqual(projected.humanActions[0], nullAction);
    assert.deepEqual(
      await readWorkspaceEvidence(settings.ownerUid, settings, async () => Response.json(body)),
      { configured: true, available: true, evidence: projected },
    );
    assert.equal(evidenceDate(projected.runs[0]?.createdAt ?? null), "Unknown");
    assert.equal(
      evidenceKnownAmount(projected.runs[1]?.cost?.aiKnownMicrocents),
      "Known amount unavailable",
    );
    assert.equal(evidenceKnownAmount(projected.runs[1]?.cost?.capabilityKnownMicrocents), "0");
    assert.equal(evidenceNumber(projected.runs[1]?.cost?.capabilityUnknownRuns), "Unknown");
  });
  it("never coerces absent dates or costs to epoch dates or zero", () => {
    assert.equal(evidenceDate(null), "Unknown");
    assert.equal(
      evidenceDate("2026-11-21T17:34:00Z"),
      new Date("2026-11-21T17:34:00Z").toLocaleString(),
    );
    assert.equal(evidenceNumber(null), "Unknown");
    assert.equal(evidenceNumber(undefined), "Unknown");
    assert.equal(evidenceNumber(0), "0");
    assert.equal(evidenceKnownAmount(null), "Known amount unavailable");
    assert.equal(evidenceKnownAmount(0), "0");
  });
  it("rejects unknown fields and PII/narratives in machine-code slots", () => {
    const base = payload();
    for (const override of [
      { id: null },
      { id: "person@example.test" },
      { workflowKey: "Contact Steve now" },
      { status: "person@example.test" },
      { email: "person@example.test" },
      { recommendedAction: "Send mail" },
    ]) {
      assert.throws(() =>
        projectWorkspaceEvidence(
          { data: { ...base.data, runs: [{ ...base.data.runs[0], ...override }] } },
          settings.mainId,
        ),
      );
    }
    assert.throws(() =>
      projectWorkspaceEvidence(
        {
          data: {
            ...base.data,
            humanActions: [{ ...base.data.humanActions[0], actionType: "person@example.test" }],
          },
        },
        settings.mainId,
      ),
    );
  });
});
