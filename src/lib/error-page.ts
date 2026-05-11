export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <title>Đã có lỗi xảy ra — VocabLab</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 15px/1.5 system-ui, -apple-system, sans-serif; background: linear-gradient(135deg,#eff6ff,#faf5ff); color: #0f172a; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 30rem; width: 100%; text-align: center; padding: 2.5rem 2rem; background: #fff; border-radius: 1.25rem; box-shadow: 0 10px 40px -10px rgba(2,6,23,.15); }
      .badge { width: 80px; height: 80px; margin: 0 auto 1.25rem; border-radius: 1rem; background: linear-gradient(135deg,#dbeafe,#ede9fe); display: grid; place-items: center; font-size: 36px; }
      .code { display: inline-block; font-weight: 700; letter-spacing: .15em; color: #2563eb; font-size: 12px; margin-bottom: .5rem; }
      h1 { font-size: 1.5rem; margin: 0 0 0.5rem; }
      p { color: #475569; margin: 0 0 1.75rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.65rem 1.1rem; border-radius: 0.85rem; font: inherit; font-weight: 600; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      .primary { background: #2563eb; color: #fff; }
      .primary:hover { background: #1d4ed8; }
      .secondary { background: #fff; color: #0f172a; border-color: #e2e8f0; }
      .secondary:hover { background: #f8fafc; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="badge">⚠️</div>
      <div class="code">LỖI 500</div>
      <h1>Trang chưa tải được</h1>
      <p>Đã có sự cố xảy ra ở phía máy chủ. Bạn có thể thử lại sau giây lát hoặc quay về danh sách bộ từ vựng.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Thử lại</button>
        <a class="secondary" href="/vocab-sets">Bộ từ vựng</a>
        <a class="secondary" href="/">Trang chủ</a>
      </div>
    </div>
  </body>
</html>`;
}
