import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readSageAssignment } from "./sage-assignment.server";

const settings = { ownerUid: "owner", key: "fixture", mainId: "main_test" };
const runId = "wfr_review";
const completed = {
  subAccountId: settings.mainId,
  data: {
    runId,
    status: "completed",
    correlationId: "evt_wfstart_review",
    approvalId: null,
    completionFact: "main_prospect_review_recorded",
    terminalReason: null,
    report: {
      excludedCount: 1,
      items: [
        { prospectId: "p_valid", outreach: { status: "do_not_contact" }, phones: ["private"] },
      ],
    },
  },
};
const reply = (body: object, status = 200) =>
  (async () => Response.json(body, { status })) as typeof fetch;

describe("Founder HQ Sage assignment reader", () => {
  it("denies other users and missing founder configuration before transport", async () => {
    const unused = (async () => assert.fail("Unexpected CRM read")) as typeof fetch;
    await assert.rejects(readSageAssignment(undefined, runId, settings, unused), /ACCESS_DENIED/);
    await assert.rejects(readSageAssignment("other", runId, settings, unused), /ACCESS_DENIED/);
    await assert.rejects(
      readSageAssignment("owner", runId, { ...settings, ownerUid: "" }, unused),
      /ACCESS_DENIED/,
    );
    assert.deepEqual(await readSageAssignment("owner", runId, { ...settings, key: "" }, unused), {
      status: "unconfigured",
    });
  });
  it("requests only the server-configured Main and validates the durable report", async () => {
    const transport = (async (input, options) => {
      const url = new URL(String(input));
      assert.equal(url.origin, "https://app.ugotleads.io");
      assert.equal(url.pathname, "/api/agent/v1/os/sage-assignment");
      assert.equal(url.searchParams.get("subAccountId"), settings.mainId);
      assert.equal(url.searchParams.get("runId"), runId);
      assert.equal(options?.method, "GET");
      assert.equal(options?.cache, "no-store");
      assert.equal(options?.redirect, "manual");
      return Response.json(completed);
    }) as typeof fetch;
    const result = await readSageAssignment("owner", runId, settings, transport);
    assert.equal(result.status, "verified");
    if (result.status !== "verified") return;
    assert.equal(result.assignment.report?.excludedCount, 1);
    assert.equal(result.assignment.report?.items[0].nextStep, "DO NOT CONTACT");
    assert.equal(result.assignment.report?.items[0].id, "p_valid");
    assert.equal(JSON.stringify(result).includes("phones"), false);
  });
  it("rejects cross-tenant and cross-run payloads or a premature report", async () => {
    for (const input of [
      { ...completed, subAccountId: "foreign" },
      { ...completed, data: { ...completed.data, runId: "another_run" } },
      { ...completed, data: { ...completed.data, status: "waiting_human" } },
    ]) {
      assert.deepEqual(await readSageAssignment("owner", runId, settings, reply(input)), {
        status: "unavailable",
      });
    }
  });
  it("shows authoritative approval or stop status and handles missing or denied reports", async () => {
    const waiting = {
      ...completed,
      data: {
        ...completed.data,
        status: "waiting_human",
        completionFact: null,
        approvalId: "action_1",
        report: null,
      },
    };
    const result = await readSageAssignment("owner", runId, settings, reply(waiting));
    assert.equal(result.status, "verified");
    if (result.status !== "verified") return;
    assert.equal(result.assignment.approvalId, "action_1");
    assert.deepEqual(await readSageAssignment("owner", runId, settings, reply({}, 404)), {
      status: "not_found",
    });
    assert.deepEqual(await readSageAssignment("owner", runId, settings, reply({}, 401)), {
      status: "unavailable",
    });
  });
});
