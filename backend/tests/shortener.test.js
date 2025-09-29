"use strict";

const crypto = require("crypto");

const BASE62_ALPHABET =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

function encodeBase62(number) {
  if (number === 0) return BASE62_ALPHABET[0];
  let n = number;
  let out = "";
  while (n > 0) {
    const r = n % 62;
    out = BASE62_ALPHABET[r] + out;
    n = Math.floor(n / 62);
  }
  return out;
}

function sha1(input) {
  return crypto.createHash("sha1").update(input).digest("hex");
}

function generateRandomCode(length) {
  const bytes = crypto.randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += BASE62_ALPHABET[bytes[i] % 62];
  }
  return out;
}

async function getOrCreateShortCode(
  redis,
  longUrl,
  ttlSeconds = 0,
  codeLength = Number(process.env.SHORT_CODE_LENGTH || 7)
) {
  const urlHash = sha1(longUrl);
  const urlKey = `url:${urlHash}`;

  // First, check if this URL already has a code
  const existing = await redis.get(urlKey);
  if (existing) return existing;

  // Try random codes until we reserve a unique one
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generateRandomCode(codeLength);
    const shortKey = `short:${code}`;

    // Reserve short code if not exists
    const shortSetArgs =
      ttlSeconds > 0
        ? [shortKey, longUrl, "NX", "EX", ttlSeconds]
        : [shortKey, longUrl, "NX"];
    const shortRes = await redis.set(...shortSetArgs);
    if (shortRes !== "OK") {
      // collision, try again
      continue;
    }

    // Bind URL -> code if not exists
    const urlSetArgs =
      ttlSeconds > 0
        ? [urlKey, code, "NX", "EX", ttlSeconds]
        : [urlKey, code, "NX"];
    const urlRes = await redis.set(...urlSetArgs);
    if (urlRes === "OK") {
      return code;
    }

    // Another writer bound the URL — clean up reservation and return existing
    await redis.del(shortKey);
    const nowExisting = await redis.get(urlKey);
    if (nowExisting) return nowExisting;
  }

  throw new Error("Failed to generate unique short code");
}

async function fetchLongUrlByCode(redis, code) {
  const key = `short:${code}`;
  return await redis.get(key);
}

module.exports = {
  encodeBase62,
  getOrCreateShortCode,
  fetchLongUrlByCode,
  generateRandomCode,
  BASE62_ALPHABET,
};
