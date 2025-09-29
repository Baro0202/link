"use strict";

const autocannon = require("autocannon");

const TARGET = process.env.BENCH_URL || "http://localhost:8080/abc";
const CONNECTIONS = Number(process.env.BENCH_CONNECTIONS || 200);
const DURATION = Number(process.env.BENCH_DURATION || 20);

async function run() {
  // Warm-up message
  // eslint-disable-next-line no-console
  console.log(
    `Running autocannon on ${TARGET} with ${CONNECTIONS} connections for ${DURATION}s`
  );

  const result = await autocannon({
    url: TARGET,
    connections: CONNECTIONS,
    duration: DURATION,
    pipelining: 1,
    method: "GET",
  });

  autocannon.printResult(result);
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
