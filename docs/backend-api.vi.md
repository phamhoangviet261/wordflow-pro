# VocabLab — Đặc Tả API Backend (Tiếng Việt)

> **Dựa trên:** Tài liệu UI v1.0  
> **Framework khuyến nghị:** TanStack Start Server Functions (`createServerFn`) + REST routes tùy chọn  
> **Mô hình xác thực:** JWT session (`userId`)  
> **Database:** PostgreSQL (khuyến nghị: Neon + Drizzle ORM hoặc Prisma)

---

## Mục lục

1. [Quy ước chung](#1-quy-ước-chung)
2. [Auth APIs](#2-auth-apis)
3. [Words APIs — Từ vựng](#3-words-apis--từ-vựng)
4. [Vocab Sets APIs — Bộ từ vựng](#4-vocab-sets-apis--bộ-từ-vựng)
5. [Sessions APIs — Phiên luyện tập](#5-sessions-apis--phiên-luyện-tập)
6. [Gamification APIs](#6-gamification-apis)
7. [Leaderboard APIs — Xếp hạng](#7-leaderboard-apis--xếp-hạng)
8. [Admin APIs](#8-admin-apis)
9. [Schema Database](#9-schema-database)
10. [Độ ưu tiên triển khai](#10-độ-ưu-tiên-triển-khai)

---

## 1. Quy Ước Chung

### Envelope Response
Mọi response đều theo cấu trúc:
```typescript
// Thành công
{ "ok": true, "data": <T> }

// Lỗi
{ "ok": false, "error": { "code": "WORD_NOT_FOUND", "message": "..." } }
```

### Mã Lỗi Thông Dụng
| Mã | HTTP | Mô tả |
|----|------|-------|
| `UNAUTHORIZED` | 401 | Chưa xác thực |
| `FORBIDDEN` | 403 | Không có quyền |
| `NOT_FOUND` | 404 | Không tìm thấy tài nguyên |
| `VALIDATION_ERROR` | 422 | Dữ liệu đầu vào không hợp lệ |
| `CONFLICT` | 409 | Trùng lặp / vi phạm ràng buộc |
| `INTERNAL_ERROR` | 500 | Lỗi server không mong muốn |

### Tham số phân trang
```
?page=1&pageSize=10&sortBy=word&sortDir=asc
```

### Header xác thực
```
Authorization: Bearer <jwt_token>
```

---

## 2. Auth APIs

### `POST /api/auth/register`
Đăng ký tài khoản mới.

**Request Body:**
```json
{
  "name": "Nguyễn Văn A",
  "email": "user@example.com",
  "password": "Secure123!"
}
```

**Ràng buộc:** email duy nhất, password tối thiểu 8 ký tự.

**Response:**
```json
{
  "ok": true,
  "data": {
    "userId": "uuid",
    "name": "Nguyễn Văn A",
    "email": "user@example.com",
    "plan": "free",
    "token": "jwt_token"
  }
}
```

---

### `POST /api/auth/login`
Đăng nhập và nhận JWT token.

**Request Body:** `{ "email": "...", "password": "..." }`

**Response:**
```json
{
  "ok": true,
  "data": {
    "token": "jwt_token",
    "user": { "userId": "uuid", "name": "...", "email": "...", "plan": "free|pro" }
  }
}
```

---

### `POST /api/auth/logout`
Vô hiệu hóa session hiện tại. **Response:** `{ "ok": true }`

---

### `GET /api/auth/me`
Lấy thông tin user đang đăng nhập.

**Response:**
```json
{
  "ok": true,
  "data": {
    "userId": "uuid", "name": "...", "email": "...",
    "plan": "free|pro", "initials": "NA", "createdAt": "ISO datetime"
  }
}

---

### `PUT /api/auth/profile`
Cập nhật thông tin hồ sơ người dùng.

**Request Body:**
```json
{
  "name": "Tên mới",
  "email": "new@example.com",
  "avatarUrl": "https://..."
}
```

**Response:** `{ "ok": true, "data": <User> }`
```

---

## 3. Words APIs — Từ vựng

> **Trang liên quan:** `/vocabulary`

### `GET /api/words`
Lấy danh sách từ của user với lọc, sắp xếp và phân trang.

**Query Parameters:**
| Param | Kiểu | Mặc định | Mô tả |
|-------|------|----------|-------|
| `q` | string | `""` | Tìm theo từ hoặc nghĩa |
| `type` | `ALL\|NOUN\|VERB\|ADJ\|ADV` | `ALL` | Lọc loại từ |
| `status` | `all\|learned\|not` | `all` | Lọc trạng thái học |
| `sortBy` | `word\|meaning\|type\|learned` | `word` | Trường sắp xếp |
| `sortDir` | `asc\|desc` | `asc` | Chiều sắp xếp |
| `page` | number | `1` | Trang |
| `pageSize` | `5\|10\|20\|50` | `10` | Số hàng mỗi trang |

**Response:**
```json
{
  "ok": true,
  "data": {
    "items": [{
      "id": "uuid", "word": "abandon", "phonetic": "/əˈbændən/",
      "meaning": "từ bỏ", "type": "VERB", "example": "...",
      "learned": true, "difficulty": 2, "tags": ["IELTS"],
      "createdAt": "ISO datetime", "updatedAt": "ISO datetime"
    }],
    "total": 120, "page": 1, "pageSize": 10, "totalPages": 12
  }
}
```

---

### `POST /api/words`
Thêm một từ mới vào danh sách của user.

**Request Body:**
```json
{
  "word": "abandon",
  "phonetic": "/əˈbændən/",
  "meaning": "từ bỏ, bỏ rơi",
  "type": "VERB",
  "example": "He abandoned his car in the snow.",
  "difficulty": 2,
  "tags": ["IELTS"]
}
```

**Ràng buộc:** `word` bắt buộc (max 60), `meaning` bắt buộc (max 200), `type` hợp lệ, từ phải duy nhất trong danh sách của user.

**Response:** `{ "ok": true, "data": <Word> }`

---

### `POST /api/words/bulk`
Thêm nhiều từ cùng lúc (nhập hàng loạt).

**Request Body:**
```json
{
  "lines": [
    "happy | hạnh phúc | ADJ | I am happy.",
    "run | chạy | VERB | I run every morning."
  ]
}
```

**Hành vi:** Parse định dạng pipe `word | meaning | TYPE | example`. Bỏ qua từ trùng lặp.

**Response:**
```json
{ "ok": true, "data": { "added": 2, "skipped": 0, "words": [<Word>, ...] } }
```

---

### `PUT /api/words/:wordId`
Cập nhật thông tin một từ. **Response:** `{ "ok": true, "data": <Word> }`

---

### `DELETE /api/words/:wordId`
Xóa một từ. **Response:** `{ "ok": true }`

---

### `PATCH /api/words/:wordId/learned`
Bật/tắt trạng thái đã học.

**Request Body:** `{ "learned": true }`  
**Response:** `{ "ok": true, "data": <Word> }`

---

### `GET /api/words/stats`
Thống kê từ vựng của user.

**Response:**
```json
{
  "ok": true,
  "data": { "total": 120, "learned": 64, "notLearned": 56, "completionPct": 53 }
}

---

### `GET /api/words/reviews`
Lấy danh sách các từ cần ôn tập hôm nay (theo thuật toán SRS).

**Query Parameters:** `pageSize` (mặc định 20)

**Response:**
```json
{
  "ok": true,
  "data": {
    "items": [<Word>, ...],
    "count": 15
  }
}
```
```

---

## 4. Vocab Sets APIs — Bộ Từ Vựng

> **Trang liên quan:** `/vocab-sets`, `/vocab-sets/:setId`

### `GET /api/vocab-sets`
Lấy tất cả bộ từ của user.

**Response:**
```json
{
  "ok": true,
  "data": [{
    "id": "uuid", "title": "Animals & Nature", "description": "...",
    "color": "from-green-400 to-emerald-500",
    "wordIds": ["uuid1", "uuid2"],
    "total": 116, "learned": 84,
    "status": "published", "difficulty": 2, "tags": [],
    "createdAt": "ISO datetime", "updatedAt": "ISO datetime"
  }]
}
```

---

### `POST /api/vocab-sets`
Tạo bộ từ mới.

**Request Body:**
```json
{
  "title": "Bộ IELTS của tôi",
  "description": "Từ vựng lõi IELTS",
  "color": "from-blue-400 to-indigo-500",
  "wordIds": ["uuid1", "uuid2"],
  "difficulty": 3,
  "tags": ["IELTS"]
}
```

**Ràng buộc:** `title` bắt buộc (max 80), `description` tùy chọn (max 300).  
**Response:** `{ "ok": true, "data": <VocabSet> }`

---

### `GET /api/vocab-sets/:setId`
Lấy chi tiết một bộ từ kèm đầy đủ thông tin từng từ.

**Response:**
```json
{
  "ok": true,
  "data": {
    "id": "uuid", "title": "...", "description": "...", "color": "...",
    "words": [<Word>, ...],
    "total": 116, "learned": 84,
    "createdAt": "ISO datetime", "updatedAt": "ISO datetime"
  }
}
```

---

### `PUT /api/vocab-sets/:setId`
Cập nhật bộ từ. **Response:** `{ "ok": true, "data": <VocabSet> }`

---

### `DELETE /api/vocab-sets/:setId`
Xóa bộ từ (không xóa từ vựng). **Response:** `{ "ok": true }`

---

### `POST /api/vocab-sets/:setId/words`
Thêm từ vào bộ từ hiện có.

**Request Body:** `{ "wordIds": ["uuid1", "uuid2"] }`  
**Response:** `{ "ok": true, "data": <VocabSet> }`

---

### `DELETE /api/vocab-sets/:setId/words/:wordId`
Xóa một từ khỏi bộ từ. **Response:** `{ "ok": true }`

---

## 5. Sessions APIs — Phiên Luyện Tập

> **Trang liên quan:** `/games/flashcard` và các game mode tương lai

### `POST /api/sessions`
Tạo và bắt đầu phiên luyện tập mới.

**Request Body:**
```json
{
  "gameMode": "flashcard",
  "vocabSetId": "uuid",
  "wordIds": ["uuid1", "uuid2"],
  "wordCount": 8
}
```

**Hành vi:** Nếu không có `vocabSetId` hoặc `wordIds`, dùng N từ chưa học đầu tiên.

**Response:**
```json
{
  "ok": true,
  "data": {
    "sessionId": "uuid",
    "gameMode": "flashcard",
    "words": [<Word>, ...],
    "startedAt": "ISO datetime"
  }
}
```

---

### `POST /api/sessions/:sessionId/answer`
Nộp câu trả lời cho một thẻ trong phiên.

**Request Body:**
```json
{ "wordId": "uuid", "result": "correct | incorrect" }
```

**Hành vi:** Cập nhật `learned` nếu đúng. Thưởng +5 XP. Tiến trình quest `q1`, `q2`.

**Response:**
```json
{
  "ok": true,
  "data": { "wordId": "uuid", "result": "correct", "xpAwarded": 5 }
}
```

---

### `POST /api/sessions/:sessionId/complete`
Kết thúc phiên và nhận phần thưởng tổng kết.

**Request Body:** `{ "correct": 6, "total": 8 }`

**Hành vi:**
- Thưởng XP bonus: `20 + correct * 2`.
- Thưởng xu bonus: `10 + correct * 3`.
- Tăng streak hằng ngày.
- Tiến trình quest `q4`.
- Lưu bản ghi phiên.

**Response:**
```json
{
  "ok": true,
  "data": {
    "sessionId": "uuid",
    "xpEarned": 32, "coinsEarned": 28,
    "correct": 6, "total": 8,
    "streakBumped": true, "newLevel": null
  }
}
```

---

### `GET /api/sessions`
Lịch sử phiên luyện tập của user.

**Query Parameters:** `page`, `pageSize`, `gameMode`

**Response:**
```json
{
  "ok": true,
  "data": {
    "items": [{
      "sessionId": "uuid", "gameMode": "flashcard",
      "correct": 6, "total": 8,
      "xpEarned": 32, "coinsEarned": 28,
      "startedAt": "ISO datetime", "completedAt": "ISO datetime"
    }],
    "total": 24, "page": 1, "pageSize": 10
  }
}

---

### `GET /api/sessions/:sessionId`
Xem chi tiết một phiên học cụ thể, bao gồm các câu trả lời.

**Response:**
```json
{
  "ok": true,
  "data": {
    "sessionId": "uuid",
    "gameMode": "flashcard",
    "correct": 6,
    "total": 8,
    "xpEarned": 32,
    "coinsEarned": 28,
    "startedAt": "ISO datetime",
    "completedAt": "ISO datetime",
    "answers": [
      {
        "wordId": "uuid",
        "word": "abandon",
        "isCorrect": true,
        "responseTimeMs": 1200,
        "userAnswer": "từ bỏ"
      }
    ]
  }
}
```
```

---

## 6. Gamification APIs

> **Trang liên quan:** HUD Header, `/store` (nhiệm vụ + cửa hàng)

### `GET /api/gamification`
Lấy toàn bộ trạng thái gamification của user.

**Response:**
```json
{
  "ok": true,
  "data": {
    "xp": 320, "level": 3, "coins": 240,
    "streak": 5, "bestStreak": 12,
    "lastActiveDay": "2026-05-11",
    "quests": [<Quest>, ...],
    "inventory": ["streak-freeze", "theme-ocean"]
  }
}
```

---

### `GET /api/gamification/quests`
Lấy danh sách nhiệm vụ hằng ngày của user (được gán cho ngày hôm nay).

**Response:**
```json
{
  "ok": true,
  "data": [
    {
      "id": "user_quest_uuid",
      "progress": 12,
      "completed": false,
      "claimed": false,
      "assignedDate": "2026-05-11",
      "template": {
        "questKey": "learn_20",
        "title": "Người học siêu tốc",
        "description": "Học 20 từ mới trong hôm nay",
        "goal": 20,
        "rewardXp": 50,
        "rewardCoins": 20
      }
    }
  ]
}
```

---

### `POST /api/gamification/quests/:userQuestId/claim`
Nhận phần thưởng của nhiệm vụ đã hoàn thành.

**Ràng buộc:** `user_quest` phải thuộc về user hiện tại, đã hoàn thành (`completed`), và chưa được nhận thưởng (`claimed`).

**Response:**
```json
{
  "ok": true,
  "data": {
    "userQuestId": "uuid",
    "xpAwarded": 50,
    "coinsAwarded": 20,
    "newXp": 360,
    "newCoins": 265,
    "newLevel": 3
  }
}
```

---

### `POST /api/gamification/shop/redeem`
Mua vật phẩm từ cửa hàng phần thưởng.

**Request Body:** `{ "itemId": "streak-freeze" }`

**Ràng buộc:**
- Vật phẩm phải tồn tại.
- User phải đủ xu.
- Vật phẩm `cosmetic`/`content`: chưa sở hữu.

**Response:**
```json
{
  "ok": true,
  "data": {
    "itemId": "streak-freeze",
    "coinsSpent": 60,
    "remainingCoins": 180,
    "inventory": ["streak-freeze"]
  }
}
```

**Mã lỗi:** `INSUFFICIENT_COINS` · `ALREADY_OWNED` · `ITEM_NOT_FOUND`

---

### `GET /api/gamification/shop`
Lấy danh mục vật phẩm trong cửa hàng.

**Response:**
```json
{
  "ok": true,
  "data": [
    {
      "id": "uuid",
      "itemKey": "streak-freeze",
      "title": "Streak Freeze",
      "price": 60,
      "itemType": "consumable"
    }
  ]
}
```

---

### `GET /api/gamification/inventory`
Lấy kho đồ hiện tại của user (các vật phẩm đã sở hữu).

**Response:**
```json
{
  "ok": true,
  "data": [
    {
      "itemId": "uuid",
      "itemKey": "streak-freeze",
      "quantity": 2
    }
  ]
}
```

---

### `GET /api/gamification/transactions`
Lấy lịch sử biến động XP và Coins.

**Query Parameters:** `page`, `pageSize`, `currency` (xp|coins|all)

**Response:**
```json
{
  "ok": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "type": "earn",
        "currency": "xp",
        "amount": 50,
        "source": "quest",
        "createdAt": "ISO datetime"
      }
    ],
    "total": 100
  }
}
```

---

### `GET /api/gamification/badges`
Lấy danh sách huy hiệu user đã đạt được và toàn bộ danh sách huy hiệu khả dụng.

**Response:**
```json
{
  "ok": true,
  "data": {
    "earned": [
      {
        "id": "uuid",
        "badgeKey": "first_word",
        "title": "Hello World",
        "earnedAt": "ISO datetime"
      }
    ],
    "all": [
      {
        "id": "uuid",
        "badgeKey": "first_word",
        "title": "Hello World",
        "description": "Thêm từ vựng đầu tiên",
        "iconUrl": "...",
        "rarity": "common"
      }
    ]
  }
}
```

---

## 7. Leaderboard APIs — Xếp Hạng

> **Trang liên quan:** `/leaderboard` (hiện là placeholder)

### `GET /api/leaderboard`
Bảng xếp hạng toàn cầu, phân trang.

**Query Parameters:**
| Param | Kiểu | Mặc định | Mô tả |
|-------|------|----------|-------|
| `period` | `weekly\|monthly\|alltime` | `weekly` | Kỳ xếp hạng |
| `metric` | `xp\|streak\|words` | `xp` | Tiêu chí xếp hạng |
| `page` | number | `1` | Trang |
| `pageSize` | number | `20` | Số hàng |

**Response:**
```json
{
  "ok": true,
  "data": {
    "period": "weekly", "metric": "xp",
    "entries": [{
      "rank": 1, "userId": "uuid",
      "name": "Nguyễn Minh Anh", "initials": "MA",
      "level": 5, "xp": 1200, "streak": 14, "wordsLearned": 240,
      "isCurrentUser": false
    }],
    "currentUserRank": { "rank": 42, "xp": 320 },
    "total": 1000
  }
}
```

---

### `GET /api/leaderboard/friends`
Bảng xếp hạng trong danh sách bạn bè.

**Response:** Cùng cấu trúc với `GET /api/leaderboard`.

---

## 8. Admin APIs

> **Trang liên quan:** `/admin`  
> **Yêu cầu quyền:** `admin`

### `GET /api/admin/users`
Danh sách tất cả user với thông tin cơ bản và thống kê.

**Query Parameters:** `q`, `page`, `pageSize`, `plan` (`free|pro|all`)

**Response:**
```json
{
  "ok": true,
  "data": {
    "items": [{
      "userId": "uuid", "name": "...", "email": "...", "plan": "free|pro",
      "level": 3, "wordsCount": 120, "streak": 5,
      "createdAt": "ISO datetime", "lastActiveAt": "ISO datetime"
    }],
    "total": 500, "page": 1, "pageSize": 20
  }
}
```

---

### `GET /api/admin/words`
Danh sách từ vựng toàn bộ hệ thống (ngân hàng từ toàn cục).

**Query Parameters:** `q`, `type`, `status`, `page`, `pageSize`  
**Response:** Cùng cấu trúc `GET /api/words` nhưng kèm trường `userId`.

---

### `POST /api/admin/words`
Thêm từ vào ngân hàng từ toàn cục. **Response:** `{ "ok": true, "data": <Word> }`

### `PUT /api/admin/words/:wordId`
Cập nhật từ trong ngân hàng toàn cục. **Response:** `{ "ok": true, "data": <Word> }`

### `DELETE /api/admin/words/:wordId`
Xóa từ khỏi ngân hàng toàn cục. **Response:** `{ "ok": true }`

---

### `GET /api/admin/stats`
Thống kê toàn nền tảng.

**Response:**
```json
{
  "ok": true,
  "data": {
    "totalUsers": 1200, "activeUsersToday": 340,
    "totalWords": 8500, "totalSessions": 45000,
    "totalXpAwarded": 2800000
  }
}
```

---

## 9. Schema Database

> **Ghi chú thiết kế:**
> - `dictionary_words` là ngân hàng từ vựng dùng chung (toàn hệ thống).
> - `user_words` theo dõi tiến độ cá nhân (đã học, độ thành thạo, số lần ôn) cho từng từ trong dictionary.
> - `vocab_sets` là **danh mục toàn cục do admin quản lý**. Mỗi bộ có `coin_price`; giá = 0 là miễn phí.
> - `user_vocab_sets` theo dõi bộ từ nào user đã mở khóa (sau khi trả coin).
> - `user_logins` lưu lịch sử đăng nhập (IP, User Agent) phục vụ bảo mật và analytics.
> - `quest_templates` lưu danh mục các nhiệm vụ khả thi trong hệ thống.
> - `user_quests` theo dõi tiến độ thực hiện nhiệm vụ hằng ngày của từng user.
> - `shop_items` là danh mục vật phẩm toàn hệ thống (streak freeze, skin...).
> - `user_inventory_items` theo dõi quyền sở hữu và số lượng vật phẩm đã mua.
> - `gamification` chỉ giữ `streak`, `best_streak`, `last_active_day`. `xp`, `coins`, `level` chuyển lên `users` để tránh join thêm khi load trang.

```sql
-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE word_type AS ENUM ('NOUN', 'VERB', 'ADJ', 'ADV');
CREATE TYPE user_plan AS ENUM ('free', 'pro');
CREATE TYPE publish_status AS ENUM ('draft', 'published');
CREATE TYPE game_mode AS ENUM ('flashcard', 'quiz', 'match', 'typing');
CREATE TYPE item_type AS ENUM ('consumable', 'cosmetic', 'content');

-- ============================================================
-- USERS — Người dùng
-- ============================================================
CREATE TABLE users (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT        NOT NULL,
  email          TEXT        UNIQUE NOT NULL,
  password_hash  TEXT        NOT NULL,
  plan           user_plan   NOT NULL DEFAULT 'free',
  -- Chỉ số gamification denormalized (đồng bộ mỗi khi thưởng/tiêu)
  xp             INT         NOT NULL DEFAULT 0,
  level          INT         NOT NULL DEFAULT 1,
  coins          INT         NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at     TIMESTAMPTZ           -- NULL = đang hoạt động; non-NULL = đã xoá mềm
);

-- Index cho truy vấn user đang hoạt động
CREATE INDEX idx_users_active ON users (id) WHERE deleted_at IS NULL;

-- ============================================================
-- USER LOGINS — Lịch sử đăng nhập (analytics & bảo mật)
-- ============================================================
CREATE TABLE user_logins (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ip_address     TEXT,
  user_agent     TEXT,
  logged_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_logins_user ON user_logins (user_id);
CREATE INDEX idx_user_logins_date ON user_logins (logged_at);

-- ============================================================
-- DICTIONARY WORDS — Ngân hàng từ vựng toàn cục
-- ============================================================
CREATE TABLE dictionary_words (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  word        TEXT        NOT NULL,
  phonetic    TEXT,
  meaning     TEXT        NOT NULL,
  type        word_type   NOT NULL,
  example     TEXT,
  difficulty  SMALLINT    CHECK (difficulty BETWEEN 1 AND 5),
  tags        TEXT[]      DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (word, type)
);

-- ============================================================
-- USER WORDS — Tiến trình học tập cá nhân
-- ============================================================
CREATE TABLE user_words (
  user_id           UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  word_id           UUID        NOT NULL REFERENCES dictionary_words(id) ON DELETE CASCADE,
  
  -- Tiến độ cơ bản
  learned           BOOLEAN     NOT NULL DEFAULT FALSE,
  mastery           SMALLINT    NOT NULL DEFAULT 0 CHECK (mastery BETWEEN 0 AND 100),
  
  -- Thuật toán SRS (ví dụ: SM-2)
  ease_factor       REAL        NOT NULL DEFAULT 2.5,
  interval_days     INT         NOT NULL DEFAULT 0,
  review_count      INT         NOT NULL DEFAULT 0, -- số lần ôn tập (repetitions)
  
  next_review_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_reviewed_at  TIMESTAMPTZ,
  
  PRIMARY KEY (user_id, word_id)
);

CREATE INDEX idx_user_words_user ON user_words (user_id);
CREATE INDEX idx_user_words_word ON user_words (word_id);
CREATE INDEX idx_user_words_next_review ON user_words (next_review_at) WHERE learned = FALSE;

-- ============================================================
-- VOCAB SETS — Bộ từ vựng (danh mục toàn cục do admin quản lý)
-- ============================================================
CREATE TABLE vocab_sets (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  -- NULL = bộ từ hệ thống/admin; non-NULL = bộ từ do user tạo
  created_by    UUID        REFERENCES users(id) ON DELETE SET NULL,
  title         TEXT        NOT NULL,
  description   TEXT,
  color         TEXT        NOT NULL DEFAULT 'from-green-400 to-emerald-500',
  coin_price    INT         NOT NULL DEFAULT 0 CHECK (coin_price >= 0),
  is_system     BOOLEAN     NOT NULL DEFAULT FALSE, -- TRUE = bộ từ chính thức của hệ thống
  is_public     BOOLEAN     NOT NULL DEFAULT TRUE,  -- TRUE = hiện trong danh mục
  status        publish_status NOT NULL DEFAULT 'published',
  difficulty    SMALLINT    CHECK (difficulty BETWEEN 1 AND 5),
  tags          TEXT[]      DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vocab_sets_public ON vocab_sets (is_public, status);
CREATE INDEX idx_vocab_sets_system ON vocab_sets (is_system);

-- ============================================================
-- TRIGGERS — Tự động cập nhật updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER tr_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER tr_dictionary_words_updated_at BEFORE UPDATE ON dictionary_words FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER tr_vocab_sets_updated_at BEFORE UPDATE ON vocab_sets FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER tr_shop_items_updated_at BEFORE UPDATE ON shop_items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Quan hệ Bộ từ ↔ Từ vựng (dùng chung cho mọi user)
CREATE TABLE vocab_set_words (
  vocab_set_id  UUID NOT NULL REFERENCES vocab_sets(id) ON DELETE CASCADE,
  word_id       UUID NOT NULL REFERENCES dictionary_words(id) ON DELETE CASCADE,
  PRIMARY KEY (vocab_set_id, word_id)
);

-- ============================================================
-- USER VOCAB SETS — Bộ từ user đã mở khóa
-- ============================================================
-- User mở khóa bộ từ bằng cách trả coin_price.
-- Nếu coin_price = 0, vẫn có thể "mở khóa" (thêm vào thư viện cá nhân).
CREATE TABLE user_vocab_sets (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        NOT NULL REFERENCES users(id)      ON DELETE CASCADE,
  vocab_set_id   UUID        NOT NULL REFERENCES vocab_sets(id) ON DELETE CASCADE,
  coins_paid     INT         NOT NULL DEFAULT 0 CHECK (coins_paid >= 0),
  progress_percent SMALLINT  NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  is_favorite    BOOLEAN     NOT NULL DEFAULT FALSE,
  unlocked_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at   TIMESTAMPTZ,
  UNIQUE (user_id, vocab_set_id)  -- mỗi user chỉ mở khóa 1 bộ 1 lần
);

CREATE INDEX idx_user_vocab_sets_user ON user_vocab_sets (user_id);

-- ============================================================
-- SESSIONS — Phiên luyện tập
-- ============================================================
CREATE TABLE sessions (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_mode    game_mode   NOT NULL,
  correct      INT         NOT NULL DEFAULT 0,
  total        INT         NOT NULL DEFAULT 0,
  xp_earned    INT         NOT NULL DEFAULT 0,
  coins_earned INT         NOT NULL DEFAULT 0,
  duration_seconds INT     NOT NULL DEFAULT 0,
  started_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_sessions_user ON sessions (user_id);

-- ============================================================
-- SESSION ANSWERS — Chi tiết câu trả lời trong phiên
-- ============================================================
CREATE TABLE session_answers (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id       UUID        NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  word_id          UUID        NOT NULL REFERENCES dictionary_words(id) ON DELETE CASCADE,
  is_correct       BOOLEAN     NOT NULL,
  response_time_ms INT,        -- thời gian phản hồi tính bằng mil giây
  user_answer      TEXT,       -- nội dung user đã nhập/chọn
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- GAMIFICATION — Trạng thái streak & inventory (1 hàng / user)
-- GHI CHÚ: xp / level / coins đã chuyển lên bảng users.
-- ============================================================
CREATE TABLE gamification (
  user_id         UUID    PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  streak          INT     NOT NULL DEFAULT 0,
  best_streak     INT     NOT NULL DEFAULT 0,
  last_active_day DATE
);

-- ============================================================
-- QUEST TEMPLATES — Danh mục nhiệm vụ mẫu
-- ============================================================
CREATE TABLE quest_templates (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_key     TEXT        UNIQUE NOT NULL, -- ví dụ: 'learn_20', 'review_10'
  title         TEXT        NOT NULL,
  description   TEXT,
  goal          INT         NOT NULL, -- mục tiêu cần đạt (số từ, số phiên...)
  reward_xp     INT         NOT NULL DEFAULT 0,
  reward_coins  INT         NOT NULL DEFAULT 0,
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- USER QUESTS — Nhiệm vụ hằng ngày của user
-- ============================================================
CREATE TABLE user_quests (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template_id   UUID        NOT NULL REFERENCES quest_templates(id) ON DELETE CASCADE,
  progress      INT         NOT NULL DEFAULT 0,
  completed     BOOLEAN     NOT NULL DEFAULT FALSE,
  claimed       BOOLEAN     NOT NULL DEFAULT FALSE,
  assigned_date DATE        NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE (user_id, template_id, assigned_date)
);

CREATE INDEX idx_user_quests_user_date ON user_quests (user_id, assigned_date);

-- ============================================================
-- SHOP ITEMS — Danh mục vật phẩm shop
-- ============================================================
CREATE TABLE shop_items (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  item_key      TEXT        UNIQUE NOT NULL, -- ví dụ: 'streak_freeze', 'theme_ocean'
  title         TEXT        NOT NULL,
  description   TEXT,
  price         INT         NOT NULL CHECK (price >= 0),
  item_type     item_type   NOT NULL,
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- USER INVENTORY — Kho đồ của người dùng
-- ============================================================
CREATE TABLE user_inventory_items (
  user_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id       UUID        NOT NULL REFERENCES shop_items(id) ON DELETE CASCADE,
  quantity      INT         NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  purchased_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, item_id)
);

-- ============================================================
-- BADGES — Danh sách huy hiệu
-- ============================================================
CREATE TABLE badges (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_key     TEXT        UNIQUE NOT NULL, -- ví dụ: 'first_word', 'streak_7', 'vocab_master'
  title         TEXT        NOT NULL,
  description   TEXT,
  icon_url      TEXT,
  rarity        TEXT        NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- USER BADGES — Huy hiệu user đã đạt được
-- ============================================================
CREATE TABLE user_badges (
  user_id       UUID        NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  badge_id      UUID        NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);

-- ============================================================
-- ECONOMY TRANSACTIONS — Nhật ký giao dịch XP và Coins
-- ============================================================
CREATE TABLE economy_transactions (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type          TEXT        NOT NULL CHECK (type IN ('earn', 'spend')),
  currency      TEXT        NOT NULL CHECK (currency IN ('xp', 'coins')),
  amount        INT         NOT NULL,
  source        TEXT        NOT NULL, -- 'quest' | 'session' | 'shop' | 'admin'
  reference_id  UUID,       -- ID liên quan (quest_id, session_id, hoặc shop_item_id)
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_economy_transactions_user ON economy_transactions (user_id);
```

---

## 10. Độ Ưu Tiên Triển Khai

| Ưu tiên | Module | APIs |
|---------|--------|------|
| 🔴 P0 (Cực kỳ quan trọng) | Auth | Register, Login, Logout, Me |
| 🔴 P0 | Từ vựng | Danh sách, Tạo, Xóa, Toggle Learned, Thống kê |
| 🔴 P0 | Gamification | Lấy trạng thái, Nhận quest, Mua shop |
| 🟡 P1 (Quan trọng) | Bộ từ vựng | CRUD + gắn từ |
| 🟡 P1 | Phiên luyện tập | Tạo, Trả lời, Hoàn thành |
| 🟢 P2 (Trung bình) | Từ vựng | Nhập hàng loạt, Cập nhật |
| 🟢 P2 | Phiên luyện tập | Lịch sử |
| 🔵 P3 (Thấp) | Xếp hạng | Bảng xếp hạng toàn cầu |
| 🔵 P3 | Admin | Quản lý user, ngân hàng từ, thống kê |

---

*Tạo ngày: 2026-05-11 | Dựa trên VocabLab UI Docs v1.0*
