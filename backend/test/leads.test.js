// API tests — run with `npm test`.
// Uses an in-memory MongoDB (mongodb-memory-server), so no local MongoDB
// or Atlas account is needed to run the tests.
const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../src/app");

let mongo;
const goodLead = {
  name: "Test User",
  email: "test@example.com",
  phone: "+91 98765 43210",
  company: "Test Co",
  source: "Website",
  status: "New",
};

before(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

after(async () => {
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
});

describe("Lead Manager API", () => {
  it("health check responds ok", async () => {
    const res = await request(app).get("/api/health");
    assert.equal(res.status, 200);
    assert.equal(res.body.status, "ok");
  });

  it("creates a lead with valid data", async () => {
    const res = await request(app).post("/api/leads").send(goodLead);
    assert.equal(res.status, 201);
    assert.equal(res.body.data.name, "Test User");
    assert.equal(res.body.data.status, "New");
  });

  it("rejects a bad email with 400", async () => {
    const res = await request(app).post("/api/leads").send({ ...goodLead, email: "not-an-email" });
    assert.equal(res.status, 400);
    assert.ok(res.body.errors.email);
  });

  it("rejects a missing name with 400", async () => {
    const { name, ...noName } = goodLead;
    const res = await request(app).post("/api/leads").send(noName);
    assert.equal(res.status, 400);
    assert.ok(res.body.errors.name);
  });

  it("rejects a duplicate email with 409", async () => {
    const res = await request(app).post("/api/leads").send(goodLead);
    assert.equal(res.status, 409);
    assert.ok(res.body.errors.email);
  });

  it("lists, searches and filters leads", async () => {
    const list = await request(app).get("/api/leads");
    assert.equal(list.status, 200);
    assert.equal(list.body.total, 1);

    const search = await request(app).get("/api/leads").query({ search: "Test" });
    assert.equal(search.body.total, 1);

    const noMatch = await request(app).get("/api/leads").query({ search: "zzz-no-such-name" });
    assert.equal(noMatch.body.total, 0);

    const filtered = await request(app).get("/api/leads").query({ status: "Lost" });
    assert.equal(filtered.body.total, 0);
  });

  it("reports dashboard counts", async () => {
    const res = await request(app).get("/api/leads/stats");
    assert.equal(res.status, 200);
    assert.equal(res.body.total, 1);
    assert.equal(res.body.byStatus.New, 1);
  });

  it("updates a lead's status", async () => {
    const list = await request(app).get("/api/leads");
    const id = list.body.data[0]._id;
    const res = await request(app).put(`/api/leads/${id}`).send({ status: "Qualified" });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.status, "Qualified");
  });

  it("returns 404 for an unknown lead", async () => {
    const res = await request(app).get("/api/leads/000000000000000000000000");
    assert.equal(res.status, 404);
  });

  it("deletes a lead", async () => {
    const list = await request(app).get("/api/leads");
    const id = list.body.data[0]._id;
    const res = await request(app).delete(`/api/leads/${id}`);
    assert.equal(res.status, 200);
    const afterDelete = await request(app).get("/api/leads");
    assert.equal(afterDelete.body.total, 0);
  });
});
