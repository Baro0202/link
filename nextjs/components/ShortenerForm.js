import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

// Prefer relative path + Next.js rewrites in production (Vercel)
const BACKEND_BASE = process.env.NEXT_PUBLIC_BACKEND_BASE || "";

export default function ShortenerForm() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setResult(null);
    setError(null);

    try {
      const u = new URL(url);
      if (!u.protocol || !u.host) throw new Error("Invalid URL");
    } catch {
      setError("Please enter a valid URL including protocol (e.g., https://)");
      return;
    }

    setLoading(true);
    try {
      const base = BACKEND_BASE ? BACKEND_BASE.replace(/\/$/, "") : "";
      const res = await fetch(`${base}/api/shorten`, {
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
    if (result) {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="row">
        <input
          className="input"
          type="url"
          placeholder="https://example.com/very/long/url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
        <button className="button" type="submit" disabled={loading}>
          {loading ? "Shortening..." : "Shorten"}
        </button>
      </div>
      {result && (
        <div className="result" style={{ flexWrap: "wrap" }}>
          <a className="link" href={result} target="_blank" rel="noreferrer">
            {result}
          </a>
          <button className="button" type="button" onClick={copy}>
            {copied ? "Copied!" : "Copy"}
          </button>
          <div style={{ marginLeft: 8 }}>
            <QRCodeCanvas value={result} size={96} includeMargin={true} />
          </div>
        </div>
      )}
      {error && <div className="error">{error}</div>}
    </form>
  );
}
