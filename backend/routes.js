"use strict";

const validator = require("validator");
const { getRedisClient, isRedisReady } = require("./redis");
const { getOrCreateShortCode, fetchLongUrlByCode } = require("./shortener");

/**
 * Fastify routes plugin
 */
module.exports = async function routes(fastify, opts) {
  const { baseUrl, ttlSeconds } = opts;
  const redis = getRedisClient();

  // POST /api/shorten
  fastify.post(
    "/api/shorten",
    {
      schema: {
        body: {
          type: "object",
          required: ["url"],
          properties: {
            url: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              short_url: { type: "string" },
            },
          },
          400: {
            type: "object",
            properties: { error: { type: "string" } },
          },
          503: {
            type: "object",
            properties: { error: { type: "string" } },
          },
        },
      },
    },
    async (request, reply) => {
      if (!isRedisReady()) {
        return reply.code(503).send({ error: "Service Unavailable" });
      }

      const { url } = request.body || {};
      if (
        typeof url !== "string" ||
        !validator.isURL(url, { require_protocol: true })
      ) {
        return reply.code(400).send({ error: "Invalid URL" });
      }

      try {
        const code = await getOrCreateShortCode(redis, url, ttlSeconds);
        const shortUrl = `${baseUrl.replace(/\/$/, "")}/${code}`;
        return reply.code(200).send({ short_url: shortUrl });
      } catch (err) {
        if (!isRedisReady()) {
          return reply.code(503).send({ error: "Service Unavailable" });
        }
        return reply.code(500).send({ error: "Internal Server Error" });
      }
    }
  );

  // GET /:short_code
  fastify.get(
    "/:short_code",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            short_code: { type: "string", pattern: "^[0-9A-Za-z]+$" },
          },
          required: ["short_code"],
        },
        response: {
          301: { type: "null" },
          404: {
            type: "object",
            properties: { error: { type: "string" } },
          },
          503: {
            type: "object",
            properties: { error: { type: "string" } },
          },
        },
      },
    },
    async (request, reply) => {
      if (!isRedisReady()) {
        return reply.code(503).send({ error: "Service Unavailable" });
      }

      const { short_code: code } = request.params;
      try {
        const longUrl = await fetchLongUrlByCode(redis, code);
        if (!longUrl) {
          return reply.code(404).send({ error: "Not found" });
        }
        reply.header("Location", longUrl);
        return reply.code(301).send();
      } catch (err) {
        if (!isRedisReady()) {
          return reply.code(503).send({ error: "Service Unavailable" });
        }
        return reply.code(500).send({ error: "Internal Server Error" });
      }
    }
  );
};
