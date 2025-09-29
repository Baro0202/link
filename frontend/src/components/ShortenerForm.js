import { useState } from "react";

const BACKEND_BASE =
  process.env.NEXT_PUBLIC_BACKEND_BASE || "http://localhost:8080";

export default function ShortenerForm() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setResult(null);
    setError(null);

    try {
      // naive validation
      const u = new URL(url);
      if (!u.protocol || !u.host) throw new Error("Invalid URL");
    } catch {
      setError("Please enter a valid URL including protocol (e.g., https://)");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_BASE}/api/shorten`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Unexpected error");
      } else {
        setResult(data.short_url);
      }
    } catch (err) {
      setError("Backend unavailable. Is Docker Compose running?");
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    if (result) await navigator.clipboard.writeText(result);
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
      <input
        type="url"
        placeholder="https://example.com/very/long/url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={{ padding: 10, fontSize: 16 }}
        required
      />
      <button
        type="submit"
        disabled={loading}
        style={{ padding: 10, fontSize: 16 }}
      >
        {loading ? "Shortening..." : "Shorten"}
      </button>
      {result && (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <a href={result} target="_blank" rel="noreferrer">
            {result}
          </a>
          <button type="button" onClick={copy}>
            Copy
          </button>
        </div>
      )}
      {error && <div style={{ color: "#c00" }}>{error}</div>}
    </form>
  );
}
