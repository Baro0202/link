import ShortenerForm from "../components/ShortenerForm";

export default function Home() {
  return (
    <div className="container">
      <header className="card" style={{ marginBottom: 16 }}>
        <h1 style={{ marginBottom: 8 }}>URL Shortener</h1>
        <div className="subtitle">
          Rút gọn liên kết nhanh, gọn, hiệu quả • QR & lịch sử
        </div>
      </header>
      <main className="card">
        <ShortenerForm />
        <div className="helper">
          Backend: http://localhost:8080 • UI: http://localhost:3000
        </div>
      </main>
    </div>
  );
}
