"use strict";

process.env.REDIS_MOCK = "true";

const request = require("supertest");
const { buildServer } = require("../server");

describe("POST /api/shorten", () => {
  test("rejects invalid url", async () => {
    const { fastify } = buildServer({ baseUrl: "http://localhost:8080" });
    const res = await request(fastify.server)
      .post("/api/shorten")
      .send({ url: "invalid" });
    expect(res.status).toBe(400);
  });

  test("returns short_url for valid url", async () => {
    const { fastify } = buildServer({ baseUrl: "http://localhost:8080" });
    const res = await request(fastify.server)
      .post("/api/shorten")
      .send({ url: "https://example.com" });
    expect(res.status).toBe(200);
    expect(res.body.short_url).toMatch(
      /^http:\/\/localhost:8080\/[0-9A-Za-z]+$/
    );
  });
});
