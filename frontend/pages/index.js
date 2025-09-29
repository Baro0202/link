import ShortenerForm from "../src/components/ShortenerForm";

export default function Home() {
  return (
    <div
      style={{
        maxWidth: 720,
        margin: "40px auto",
        padding: 16,
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Ubuntu",
      }}
    >
      <h1>URL Shortener</h1>
      <ShortenerForm />
    </div>
  );
}
