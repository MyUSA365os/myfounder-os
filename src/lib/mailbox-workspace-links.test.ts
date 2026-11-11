import { describe, it as test } from "node:test";
import assert from "node:assert/strict";
import { mailboxLinkForBusiness } from "./mailbox-workspace-links";

const CLEANMYTAP_URL = "https://app.ugotleads.io/sa/7EEuME2zYZSLui2b3BOX/dashboard/settings";

describe("mailboxLinkForBusiness", () => {
  test("returns the verified CleanMyTap uGotLeads settings URL", () => {
    assert.equal(mailboxLinkForBusiness("CleanMyTap"), CLEANMYTAP_URL);
  });

  test("returns null for every unverified business name", () => {
    for (const name of [
      "CleanMyTap & Co",
      "CleanMyTap ",
      "cleanmytap",
      "Meridian Growth Partners",
      "StellaNova",
      "Business",
      "",
    ]) {
      assert.equal(mailboxLinkForBusiness(name), null, `expected null for ${JSON.stringify(name)}`);
    }
  });

  test("never resolves inherited object properties", () => {
    for (const name of ["toString", "constructor", "__proto__", "hasOwnProperty"]) {
      assert.equal(mailboxLinkForBusiness(name), null, `expected null for ${name}`);
    }
  });
});
