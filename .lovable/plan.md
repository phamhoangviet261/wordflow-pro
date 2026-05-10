## Vocabulary Learning App — Implementation Plan

> Note: Next.js 16 / Prisma không dùng được trên nền tảng này. Sẽ build bằng **TanStack Start + React 19 + Tailwind v4 + shadcn/ui** (tương đương App Router), dữ liệu mock client-side. Có thể bật Lovable Cloud sau nếu cần lưu trữ.

### Layout & Routing
File-based routes trong `src/routes/`:
```
__root.tsx                  (giữ nguyên)
_app.tsx                    layout: Sidebar + Header + <Outlet/>
_app.index.tsx              /            Trang chủ
_app.vocab-sets.tsx         /vocab-sets  Bộ từ vựng
_app.vocabulary.tsx         /vocabulary  Từ vựng
_app.games.tsx              /games       Game phản xạ
_app.store.tsx              /store       Cửa hàng (placeholder)
_app.leaderboard.tsx        /leaderboard Xếp hạng (placeholder)
```
Xoá `src/routes/index.tsx` placeholder. Mỗi route có `head()` riêng (title + description).

### Shared UI (`src/components/`)
- `layout/AppSidebar.tsx` — sidebar trắng cố định, logo, nav (Home/Sets/Vocabulary/Games/Store/Leaderboard), active = `bg-green-100 text-green-600`, dùng `useRouterState`.
- `layout/AppHeader.tsx` — phải: streak pill (Flame + số), nút cam "★ NÂNG CẤP PRO".
- `home/`: `StatCard`, `StreakCard` (7-day flame tracker), `QuickAccessCard`, `CourseCard`, `FilterChips`, `HeroBanner`.
- `vocab-sets/VocabSetCard.tsx`.
- `vocabulary/`: `WordRow`, `SummaryStat`.
- `games/`: `GameModeCard`, `SrsBanner`.
- `lib/mock-data.ts` — courses, sets, words, game modes, streak data.

### Page Specs

**Trang chủ (`/`)**
- Grid trên: banner illustration (trái, span 2) · 2×2 stat cards (Tổng từ / Đã học / Tiến độ % / Cần ôn) · Streak card cam với 7 ngày flame.
- Truy cập nhanh: 4 card trắng shadow (Thêm từ — blue, Luyện tập — purple, Xếp hạng — orange, Cộng đồng — green) với icon chip màu nền nhạt.
- Lộ trình học: filter chips (Tất cả active xanh, THPT, IELTS, TOEIC, TOEFL, Giao tiếp) + grid course cards (tên, số từ, progress bar, "Độ khó X/5" dạng dot).

**Bộ từ vựng (`/vocab-sets`)**
- Hai nút: xanh "+ TẠO BỘ TỪ MỚI", vàng "LỘ TRÌNH".
- Grid card: tiêu đề + checkbox góc phải, mô tả, list-icon + "116 từ", progress bar "X/Y", footer: nút xanh "Xem" + 3 icon (Play, Edit, Trash).

**Từ vựng (`/vocabulary`)**
- 4 stat card (Tổng / Đã học / Chưa học / %).
- Toolbar: search input trái, hai nút xanh "Thêm từ với AI" và "Thêm nhiều từ" phải.
- Danh sách từ — mỗi row: speaker icon · từ (bold) + phonetic dưới · nghĩa · badge xanh NOUN/VERB · ví dụ italic muted · Switch "đã học" bên phải (toggle local state).

**Game phản xạ (`/games`)**
- Grid 3×2 card lớn rounded-2xl: Flashcard (purple), Quiz (orange), Match (blue), Typing (green), Listening (teal), Mixed (pink + badge HOT).
- Dưới: banner full-width tím "Ôn tập ngắt quãng (SRS)" + nút "Bắt đầu ôn tập".

**Store / Leaderboard** — placeholder "Sắp ra mắt" giữ điều hướng.

### Design tokens
Bổ sung vào `src/styles.css` (cả `:root` và `@theme inline`) các biến oklch:
`--accent-green`, `--accent-orange`, `--accent-purple`, `--accent-blue`, `--accent-teal`, `--accent-pink`, `--accent-yellow` + biến nền nhạt tương ứng cho icon chip. Components chỉ dùng token, không hardcode hex.

### Assets
- 1 illustration banner cho Home (generate bằng imagegen, lưu `src/assets/`).

### Out of scope
- Không có auth / DB / persistence (mock thuần).
- Game cards click → "Sắp ra mắt"; chưa cài gameplay.
- Không cài Next.js/Prisma (không hỗ trợ trên nền tảng).

### Acceptance
- Sidebar điều hướng OK, active highlight đúng route.
- 4 trang chính render đúng spec ở desktop (≥1024px), responsive cơ bản ở tablet.
- Build pass, không có màu hardcode ngoài token.