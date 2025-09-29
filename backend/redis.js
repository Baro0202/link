"use strict";

const useMock =
  process.env.NODE_ENV === "test" || process.env.REDIS_MOCK === "true";
const Redis = useMock ? require("ioredis-mock") : require("ioredis");

let client;

function createClient() {
  if (client) return client;
  const host = process.env.REDIS_HOST || "127.0.0.1";
  const port = Number(process.env.REDIS_PORT || 6379);

  client = new Redis({
    host,
    port,
    enableReadyCheck: true,
    lazyConnect: false,
    maxRetriesPerRequest: null,
    reconnectOnError: (err) => {
      // Retry on connection issues
      return true;
    },
  });

  client.on("error", () => {
    // Swallow to avoid noisy logs in production; handlers check readiness
  });

  return client;
}

function getRedisClient() {
  if (!client) {
    client = createClient();
  }
  return client;
}

function isRedisReady() {
  const c = getRedisClient();
  return c.status === "ready" || useMock;
}

module.exports = { getRedisClient, isRedisReady };
