"use strict";

const Fastify = require("fastify");
const cors = require("@fastify/cors");
const routes = require("./routes");

function buildServer(options = {}) {
  const port = Number(process.env.PORT || options.port || 3000);
  const host = process.env.HOST || options.host || "0.0.0.0";
  const baseUrl =
    process.env.BASE_URL || options.baseUrl || `http://localhost:${port}`;
  const ttlSeconds = Number(
    process.env.SHORT_URL_TTL_SECONDS || options.ttlSeconds || 0
  );
  const corsOrigin = process.env.CORS_ORIGIN || options.corsOrigin || "*";

  const fastify = Fastify({
    logger: false,
    keepAliveTimeout: 65_000,
    requestTimeout: 0,
    connectionTimeout: 0,
  });

  fastify.register(cors, {
    origin: corsOrigin,
    methods: ["GET", "POST", "OPTIONS"],
    credentials: false,
  });

  fastify.register(routes, { baseUrl, ttlSeconds });

  // Health check fallback if plugin fails for any reason
  fastify.get("/healthz", async (_, reply) => {
    reply.code(200).type("text/plain").send("ok");
  });

  // Expose convenience start method
  async function start() {
    try {
      await fastify.listen({ port, host });
      // eslint-disable-next-line no-console
      console.log(`Server listening on http://${host}:${port}`);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to start server", err);
      process.exit(1);
    }
  }

  return { fastify, start };
}

if (require.main === module) {
  const { start } = buildServer();
  start();
}

module.exports = { buildServer };
