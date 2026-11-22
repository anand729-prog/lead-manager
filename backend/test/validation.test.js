// Pure validation tests — no database needed, run with `npm test`.
// (test/leads.test.js covers the API end-to-end against in-memory MongoDB.)
const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { validateLead } = require("../src/validation");

const good = {
  name: "Test User",
  email: "test@example.com",
  phone: "+91 98765 43210",
  company: "Test Co",
  source: "Website",
  status: "New",
};

describe("validateLead", () => {
  it("accepts a complete valid lead", () => {
    assert.deepEqual(validateLead(good), {});
  });

  it("requires name, email and phone", () => {
    const errors = validateLead({ company: "X" });
    assert.ok(errors.name && errors.email && errors.phone);
  });

  it("rejects a bad email", () => {
    assert.ok(validateLead({ ...good, email: "not-an-email" }).email);
    assert.ok(validateLead({ ...good, email: "a@b" }).email);
  });

  it("rejects a bad phone number", () => {
    assert.ok(validateLead({ ...good, phone: "abc" }).phone);
    assert.ok(validateLead({ ...good, phone: "12" }).phone);
  });

  it("accepts common Indian phone formats", () => {
    for (const phone of ["9876543210", "+91 98765 43210", "09876543210", "98765-43210"]) {
      assert.deepEqual(validateLead({ ...good, phone }), {}, phone);
    }
  });

  it("rejects an unknown source and status", () => {
    const errors = validateLead({ ...good, source: "Smoke Signal", status: "Maybe" });
    assert.ok(errors.source && errors.status);
  });

  it("partial validation only checks the fields given (for PUT)", () => {
    assert.deepEqual(validateLead({ status: "Qualified" }, { partial: true }), {});
    assert.ok(validateLead({ status: "Maybe" }, { partial: true }).status);
  });
});
