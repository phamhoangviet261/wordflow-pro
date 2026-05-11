# VocabLab — UI Documentation (English)

> **App Name:** VocabLab  
> **Stack:** TanStack Start · React 19 · Tailwind CSS 4 · Lucide Icons  
> **Routing:** File-based routing via TanStack Router

---

## Table of Contents

1. [Application Shell](#1-application-shell)
2. [Page: Home (`/`)](#2-page-home-)
3. [Page: Vocabulary (`/vocabulary`)](#3-page-vocabulary-vocabulary)
4. [Page: Vocab Sets (`/vocab-sets`)](#4-page-vocab-sets-vocab-sets)
5. [Page: Vocab Set Detail (`/vocab-sets/:setId`)](#5-page-vocab-set-detail-vocab-setssetid)
6. [Page: Games (`/games`)](#6-page-games-games)
7. [Page: Flashcard Game (`/games/flashcard`)](#7-page-flashcard-game-gamesflashcard)
8. [Page: Rewards / Store (`/store`)](#8-page-rewards--store-store)
9. [Page: Leaderboard (`/leaderboard`)](#9-page-leaderboard-leaderboard)
10. [Page: Admin (`/admin`)](#10-page-admin-admin)
11. [Shared Components](#11-shared-components)
12. [Data Models](#12-data-models)

---

## 1. Application Shell

The shell wraps every authenticated page and provides persistent navigation.

### Desktop Layout (`≥ md`)
| Zone | Component | Description |
|------|-----------|-------------|
| Left sidebar | `AppSidebar` | Fixed, 256px wide. Contains logo, nav items, user profile menu. |
| Top header | `AppHeader` | Sticky, right-aligned. Shows gamification stats and "Upgrade PRO" button. |
| Main area | `<main>` | Scrollable, `px-8 pb-10`. Renders the active `<Outlet>`. |

### Mobile Layout (`< md`)
| Zone | Component | Description |
|------|-----------|-------------|
| Top navbar | `MobileNavbar` | Fixed, `z-40`. Left: hamburger + logo. Right: gamification stats. |
| Slide sidebar | `MobileSidebar` | Slides from left on toggle. Backdrop overlay. ESC / backdrop click closes. Body scroll locks while open. |
| Main area | `<main>` | `px-4 pb-10`. Renders the active `<Outlet>`. |

### Navigation Items
| Label | Route | Icon |
|-------|-------|------|
| Trang chủ (Home) | `/` | `Home` |
| Bộ từ vựng (Vocab Sets) | `/vocab-sets` | `BookMarked` |
| Từ vựng (Vocabulary) | `/vocabulary` | `BookOpen` |
| Game phản xạ (Games) | `/games` | `Gamepad2` |
| Phần thưởng (Rewards) | `/store` | `Gift` |
| Xếp hạng (Leaderboard) | `/leaderboard` | `Trophy` |
| Quản trị (Admin) | `/admin` | `Shield` |

### Gamification HUD (`HeaderStats`)
Always visible in the header/navbar.
- **Streak** — orange pill badge with `Flame` icon.
- **Coins** — amber pill badge with `Coins` icon + animated count-up.
- **Level + XP bar** — circular level badge + animated progress bar (hidden on `< sm`).

### User Profile Menu (Desktop sidebar only)
Popup triggered from user avatar at bottom of sidebar.
- **Header card:** Avatar initials, name, email, plan badge.
- **Stats grid:** Level · Streak · Coins.
- **Actions:** Profile, Settings, Logout.

### Global Toasts
Uses **Sonner** (`richColors`, position `top-right`).

### Gamification Overlays
- `FloatingFeedback` — floating +XP / +Coins particles on earn events.
- `LevelUpModal` — modal popup when player levels up.

---

## 2. Page: Home (`/`)

**Title:** `Trang chủ — VocabLab`

### Sections

#### 2.1 Hero Grid (`grid lg:grid-cols-4`)
- **Banner image** (col-span-2) — full-bleed photo.
- **Stats cards** (2×2 grid):
  | Stat | Accent |
  |------|--------|
  | Total words | Blue |
  | Learned | Green |
  | Progress % | Purple |
  | Need review | Orange |
- **Streak card** — gradient orange panel. Shows current streak count + 7-day calendar grid with flame icons.

#### 2.2 Quick Access
4 shortcut buttons in a responsive grid:
- Add Word, Practice, Leaderboard, Community.

#### 2.3 Learning Path
- **Category filter pills**: All, THPT, IELTS, TOEIC, TOEFL, Speaking.
- **Course cards** (responsive grid) — each shows:
  - Color bar, title, category badge.
  - Word count + learned count.
  - Progress bar.
  - Difficulty (1–5 dots).

---

## 3. Page: Vocabulary (`/vocabulary`)

**Title:** `Từ vựng — VocabLab`

### Stats Row
4 cards: Total words · Learned · Not learned · Completion %.

### Toolbar
| Control | Type | Options |
|---------|------|---------|
| Search | Text input | Filters by `word` or `meaning` |
| Word type | Select | ALL · NOUN · VERB · ADJ · ADV |
| Status | Select | All · Learned · Not learned |
| Add Bulk | Button (Dialog) | Opens paste dialog (pipe-separated format) |
| Add Single | Button (Dialog) | Opens single-word form |

#### Add Single Word Form
Fields: Word* · Phonetic · Meaning* · Word Type · Example.

#### Add Bulk Words Dialog
Paste multi-line text in format: `word | meaning | TYPE | example`

### Vocabulary Table
Sortable columns: Word · Meaning · Type · Learned status.
Per row:
- 🔊 Speak button (Web Speech API).
- Word + phonetic.
- Meaning (hidden `< md`).
- Type badge (hidden `< md`).
- Example (hidden `< lg`, truncated).
- Learned toggle (Switch).
- Delete button (hover reveal, with confirm dialog).

### Pagination
- Page-size selector: 5 · 10 · 20 · 50.
- Prev/Next buttons.
- Page indicator.

### Confirm Dialog
Generic inline confirmation modal for destructive actions.

---

## 4. Page: Vocab Sets (`/vocab-sets`)

**Title:** `Bộ từ vựng — VocabLab`

### Actions Bar
- **"TẠO BỘ TỪ MỚI"** (green) — opens creation dialog.
- **"LỘ TRÌNH"** (yellow) — roadmap button (placeholder).

### Create Vocab Set Dialog
Fields:
| Field | Type | Constraints |
|-------|------|-------------|
| Name* | Text | max 80 chars |
| Description | Textarea | max 300 chars |
| Color theme | 6 color pills | gradient options |
| Word selector | Scrollable checkbox list | picks from global word list |

### Vocab Set Cards Grid
Responsive: `sm:grid-cols-2 lg:grid-cols-3`.

Each card:
- Gradient top bar (set color).
- Title + selection checkbox.
- Description (2-line clamp).
- Word count + learned count.
- Progress bar (gradient).
- Actions: **View** (→ detail page) · **Play** · **Edit** · **Delete**.

---

## 5. Page: Vocab Set Detail (`/vocab-sets/:setId`)

**Title:** `Chi tiết bộ từ — VocabLab`

### Header Banner
Gradient (set color). Shows: title, description, word count, learned count, progress bar.
Actions: **Practice** (→ flashcard) · **Delete**.

### Word List Table
Columns: 🔊 Speak · Word + phonetic · Meaning · Type badge · Learned badge.

### Error States
- **Not found** — friendly empty state with links to go back or home.
- **Load error** — retry button.

---

## 6. Page: Games (`/games`)

**Title:** `Game phản xạ — VocabLab`

### Game Mode Cards
Responsive grid of 6 modes:
| Mode | Gradient | Status |
|------|----------|--------|
| Flashcard | Purple | ✅ Active |
| Trắc nghiệm (Quiz) | Orange | Placeholder |
| Nối từ (Match) | Blue | Placeholder |
| Gõ từ (Typing) | Green | Placeholder |
| Nghe viết (Dictation) | Teal | Placeholder |
| Tổng hợp (Mixed) | Pink | HOT badge |

### SRS Promo Banner
Full-width gradient purple panel promoting Spaced Repetition System with a CTA button.

---

## 7. Page: Flashcard Game (`/games/flashcard`)

**Title:** `Flashcard — VocabLab`

### Game State
- Deck: first 8 words from global word list.
- Each card: `undefined` | `true` (known) | `false` (unknown).

### Progress Bar
Shows current card index / total, known count (green) / unknown count (red).

### Flip Card
- **Front face** — gradient purple. Shows: word, phonetic, type badge, 🔊 speak button.
- **Back face** — white. Shows: type, meaning, example sentence.
- Click anywhere on card to flip (CSS `perspective` + `rotateY` transition).

### Answer Controls
- ❌ **Chưa thuộc** (Not known) — red button, awards 0 XP.
- ✅ **Đã thuộc** (Known) — green button, awards +5 XP, progresses quests.

### Navigation Controls
Back · Reset · Next buttons.

### Completion States
- **Inline banner** — "Finished! You know X/Y words" + replay button.
- **`SessionCompleteModal`** — overlay modal showing: XP earned, coins earned, correct/total summary.

### Gamification on Completion
Awards bonus XP + coins. Bumps daily streak. Progresses quest `q4`.

---

## 8. Page: Rewards / Store (`/store`)

**Title:** `Phần thưởng — VocabLab`

### Coin Balance
Displayed in amber badge at top right.

### Streak Card
- Current streak + record.
- Progress bar to next milestone.
- Milestone badges: 3 · 7 · 14 · 30 · 60 · 100 days.
- Motivational quote.

### Daily Quests
4 quests refreshed every 24h:
| Quest | Goal | Rewards |
|-------|------|---------|
| Learn 20 new words | 20 | 50 XP + 30 coins |
| Review 10 words | 10 | 30 XP + 20 coins |
| 5 correct answers in a row | 5 | 40 XP + 25 coins |
| Play 1 mini-game | 1 | 25 XP + 15 coins |

Each quest shows: progress bar · current/goal · claim button (enabled when complete).

### Reward Shop
Category filter: All · Boost · Content · Cosmetics · Utility.

Shop items:
| ID | Name | Cost | Category |
|----|------|------|----------|
| `ai-explain` | AI Explanation | 80 | Boost |
| `pack-business` | Business+ Pack | 250 | Content |
| `pack-ielts` | IELTS 7+ Pack | 320 | Content |
| `streak-freeze` | Streak Freeze | 60 | Utility |
| `theme-sunset` | Theme Sunset | 150 | Cosmetic |
| `theme-ocean` | Theme Ocean | 150 | Cosmetic |
| `extra-retry` | +3 Retries | 40 | Utility |

Redeem confirmation modal before purchase.

---

## 9. Page: Leaderboard (`/leaderboard`)

**Title:** `Xếp hạng — VocabLab`

**Status:** Placeholder — "Coming soon" state with trophy icon.

---

## 10. Page: Admin (`/admin`)

**Title:** `Quản trị — VocabLab`

Full-featured admin panel. (Implementation detail in `_app.admin.tsx`.)

---

## 11. Shared Components

| Component | Path | Description |
|-----------|------|-------------|
| `AppSidebar` | `components/layout/AppSidebar.tsx` | Desktop sidebar with nav + user menu |
| `SidebarContent` | `components/layout/SidebarContent.tsx` | Shared nav items (reused by mobile + desktop) |
| `AppHeader` | `components/layout/AppHeader.tsx` | Desktop sticky header |
| `MobileNavbar` | `components/layout/MobileNavbar.tsx` | Mobile fixed top navbar |
| `MobileSidebar` | `components/layout/MobileSidebar.tsx` | Mobile slide-out sidebar |
| `HeaderStats` | `components/gamification/HeaderStats.tsx` | XP/streak/coins HUD |
| `FloatingFeedback` | `components/gamification/FloatingFeedback.tsx` | Floating +XP/+coins particles |
| `LevelUpModal` | `components/gamification/LevelUpModal.tsx` | Level-up celebration modal |
| `SessionCompleteModal` | `components/gamification/SessionCompleteModal.tsx` | Post-game result modal |

---

## 12. Data Models

### `Word`
```typescript
type Word = {
  id: string;
  word: string;
  phonetic: string;
  meaning: string;
  type: "NOUN" | "VERB" | "ADJ" | "ADV";
  example: string;
  learned: boolean;
  status?: "draft" | "published";
  difficulty?: 1 | 2 | 3 | 4 | 5;
  tags?: string[];
};
```

### `VocabSet`
```typescript
type VocabSet = {
  id: string;
  title: string;
  description: string;
  total: number;      // derived: wordIds.length
  learned: number;    // derived: count of learned words in set
  color: string;      // Tailwind gradient class
  wordIds: string[];
  status?: "draft" | "published";
  difficulty?: 1 | 2 | 3 | 4 | 5;
  tags?: string[];
};
```

### `GamificationState`
```typescript
type GamificationState = {
  xp: number;
  level: number;
  coins: number;
  streak: number;
  bestStreak: number;
  lastActiveDay: string; // ISO date "YYYY-MM-DD"
  quests: Quest[];
  inventory: string[];   // array of ShopItem IDs
};
```

### `Quest`
```typescript
type Quest = {
  id: string;
  title: string;
  description: string;
  goal: number;
  progress: number;
  rewardXp: number;
  rewardCoins: number;
  completed: boolean;
  claimed: boolean;
};
```

### `ShopItem`
```typescript
type ShopItem = {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: "sparkles" | "package" | "snowflake" | "palette" | "rotate";
  category: "boost" | "content" | "cosmetic" | "utility";
};
```

---

*Generated: 2026-05-11 | VocabLab v1.0*
