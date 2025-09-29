/** @type {import('next').NextConfig} */
const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN || "";

module.exports = {
  reactStrictMode: true,
  async rewrites() {
    if (!BACKEND_ORIGIN) return [];
    return [
      { source: "/api/shorten", destination: `${BACKEND_ORIGIN}/api/shorten` },
      { source: "/healthz", destination: `${BACKEND_ORIGIN}/healthz` },
      {
        source: "/ticketbox/:code",
        destination: `${BACKEND_ORIGIN}/ticketbox/:code`,
      },
      { source: "/:code", destination: `${BACKEND_ORIGIN}/:code` },
    ];
  },
};
