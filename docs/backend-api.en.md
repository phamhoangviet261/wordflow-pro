# VocabLab — Backend API Specification (English)

> **Based on:** UI Documentation v1.0  
> **Framework recommendation:** TanStack Start Server Functions (`createServerFn`) + optional REST routes  
> **Auth model:** JWT session (user identified by `userId`)  
> **Database:** PostgreSQL (recommended: Neon + Drizzle ORM or Prisma)

---

## Table of Contents

1. [Common Conventions](#1-common-conventions)
2. [Auth APIs](#2-auth-apis)
3. [Words APIs](#3-words-apis)
4. [Vocab Sets APIs](#4-vocab-sets-apis)
5. [Games / Practice Session APIs](#5-games--practice-session-apis)
6. [Gamification APIs](#6-gamification-apis)
7. [Leaderboard APIs](#7-leaderboard-apis)
8. [Admin APIs](#8-admin-apis)
9. [Database Schema](#9-database-schema)
10. [Implementation Priority](#10-implementation-priority)

---

## 1. Common Conventions

### Response Envelope
All API responses follow this shape:
```typescript
// Success
{
  "ok": true,
  "data": <T>
}

// Error
{
  "ok": false,
  "error": {
    "code": "WORD_NOT_FOUND",
    "message": "Word with the given ID was not found."
  }
}
```

### Common Error Codes
| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Authenticated but lacks permission |
| `NOT_FOUND` | 404 | Resource does not exist |
| `VALIDATION_ERROR` | 422 | Invalid input payload |
| `CONFLICT` | 409 | Duplicate / constraint violation |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

### Pagination Parameters
```
?page=1&pageSize=10&sortBy=word&sortDir=asc
```

### Auth Header
```
Authorization: Bearer <jwt_token>
```

---

## 2. Auth APIs

### `POST /api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "name": "Nguyễn Văn A",
  "email": "user@example.com",
  "password": "Secure123!"
}
```

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

**Validation:**
- `email`: unique, valid email format.
- `password`: min 8 characters.
- `name`: 1–100 characters.

---

### `POST /api/auth/login`
Authenticate and receive a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Secure123!"
}
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "token": "jwt_token",
    "user": {
      "userId": "uuid",
      "name": "string",
      "email": "string",
      "plan": "free | pro"
    }
  }
}
```

---

### `POST /api/auth/logout`
Invalidate the current session token.

**Response:** `{ "ok": true }`

---

### `GET /api/auth/me`
Get the currently authenticated user's profile.

**Response:**
```json
{
  "ok": true,
  "data": {
    "userId": "uuid",
    "name": "string",
    "email": "string",
    "plan": "free | pro",
    "initials": "NA",
    "createdAt": "ISO datetime"
  }
}
```

---

### `PUT /api/auth/profile`
Update user profile information.

**Request Body:**
```json
{
  "name": "New Name",
  "email": "new@example.com",
  "avatarUrl": "https://..."
}
```

**Response:** `{ "ok": true, "data": <User> }`
```

---

## 3. Words APIs

> **Context:** Supports the `/vocabulary` page — CRUD for the user's personal word list.

---

### `GET /api/words`
List the authenticated user's words with filtering, sorting, and pagination.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `q` | string | `""` | Search by word or meaning |
| `type` | `ALL\|NOUN\|VERB\|ADJ\|ADV` | `ALL` | Filter by word type |
| `status` | `all\|learned\|not` | `all` | Filter by learned status |
| `sortBy` | `word\|meaning\|type\|learned` | `word` | Sort field |
| `sortDir` | `asc\|desc` | `asc` | Sort direction |
| `page` | number | `1` | Page number |
| `pageSize` | `5\|10\|20\|50` | `10` | Items per page |

**Response:**
```json
{
  "ok": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "word": "abandon",
        "phonetic": "/əˈbændən/",
        "meaning": "từ bỏ, bỏ rơi",
        "type": "VERB",
        "example": "He abandoned his car.",
        "learned": true,
        "status": "published",
        "difficulty": 2,
        "tags": ["IELTS"],
        "createdAt": "ISO datetime",
        "updatedAt": "ISO datetime"
      }
    ],
    "total": 120,
    "page": 1,
    "pageSize": 10,
    "totalPages": 12
  }
}
```

---

### `POST /api/words`
Add a new word to the user's vocabulary list.

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

**Validation:**
- `word`: required, 1–60 chars, unique per user.
- `meaning`: required, 1–200 chars.
- `type`: one of `NOUN | VERB | ADJ | ADV`.
- `phonetic`: optional, max 60 chars.
- `example`: optional, max 500 chars.

**Response:** `{ "ok": true, "data": <Word> }`

---

### `POST /api/words/bulk`
Add multiple words at once (bulk import).

**Request Body:**
```json
{
  "lines": [
    "happy | hạnh phúc | ADJ | I am happy.",
    "run | chạy | VERB | I run every morning."
  ]
}
```

**Behavior:**
- Parse pipe-separated format: `word | meaning | TYPE | example`.
- Skip duplicates silently.
- Return count of added/skipped.

**Response:**
```json
{
  "ok": true,
  "data": {
    "added": 2,
    "skipped": 0,
    "words": [<Word>, ...]
  }
}
```

---

### `PUT /api/words/:wordId`
Update an existing word.

**Request Body:** Same fields as `POST /api/words` (all optional).

**Response:** `{ "ok": true, "data": <Word> }`

---

### `DELETE /api/words/:wordId`
Delete a word from the user's list.

**Response:** `{ "ok": true }`

---

### `PATCH /api/words/:wordId/learned`
Toggle the learned status of a word.

**Request Body:**
```json
{ "learned": true }
```

**Response:** `{ "ok": true, "data": <Word> }`

---

```

---

### `GET /api/words/reviews`
Get words scheduled for review today (SRS).

**Query Parameters:** `pageSize` (default 20)

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
```json
{
  "ok": true,
  "data": {
    "total": 120,
    "learned": 64,
    "notLearned": 56,
    "completionPct": 53
  }
}
```

---

## 4. Vocab Sets APIs

> **Context:** Supports `/vocab-sets` (list) and `/vocab-sets/:setId` (detail).

---

### `GET /api/vocab-sets`
List all vocab sets belonging to the current user.

**Response:**
```json
{
  "ok": true,
  "data": [
    {
      "id": "uuid",
      "title": "Animals & Nature",
      "description": "...",
      "color": "from-green-400 to-emerald-500",
      "wordIds": ["uuid1", "uuid2"],
      "total": 116,
      "learned": 84,
      "status": "published",
      "difficulty": 2,
      "tags": [],
      "createdAt": "ISO datetime",
      "updatedAt": "ISO datetime"
    }
  ]
}
```

---

### `POST /api/vocab-sets`
Create a new vocab set.

**Request Body:**
```json
{
  "title": "My IELTS Set",
  "description": "Core IELTS vocabulary",
  "color": "from-blue-400 to-indigo-500",
  "wordIds": ["uuid1", "uuid2"],
  "difficulty": 3,
  "tags": ["IELTS"]
}
```

**Validation:**
- `title`: required, 1–80 chars.
- `description`: optional, max 300 chars.
- `color`: valid gradient class string.
- `wordIds`: array of valid word IDs belonging to the user.

**Response:** `{ "ok": true, "data": <VocabSet> }`

---

### `GET /api/vocab-sets/:setId`
Get a single vocab set with full word details.

**Response:**
```json
{
  "ok": true,
  "data": {
    "id": "uuid",
    "title": "Animals & Nature",
    "description": "...",
    "color": "...",
    "words": [<Word>, ...],
    "total": 116,
    "learned": 84,
    "createdAt": "ISO datetime",
    "updatedAt": "ISO datetime"
  }
}
```

---

### `PUT /api/vocab-sets/:setId`
Update a vocab set (title, description, color, wordIds).

**Request Body:** Same as POST (all fields optional).

**Response:** `{ "ok": true, "data": <VocabSet> }`

---

### `DELETE /api/vocab-sets/:setId`
Delete a vocab set (does not delete words).

**Response:** `{ "ok": true }`

---

### `POST /api/vocab-sets/:setId/words`
Add words to an existing vocab set.

**Request Body:**
```json
{ "wordIds": ["uuid1", "uuid2"] }
```

**Response:** `{ "ok": true, "data": <VocabSet> }`

---

### `DELETE /api/vocab-sets/:setId/words/:wordId`
Remove a word from a vocab set.

**Response:** `{ "ok": true }`

---

## 5. Games / Practice Session APIs

> **Context:** Supports `/games/flashcard` and future game modes.

---

### `POST /api/sessions`
Create and start a new practice session.

**Request Body:**
```json
{
  "gameMode": "flashcard",
  "vocabSetId": "uuid",           // optional: practice specific set
  "wordIds": ["uuid1", "uuid2"],  // optional: practice specific words
  "wordCount": 8                  // default: 8
}
```

**Behavior:** If neither `vocabSetId` nor `wordIds` is provided, use the first N unlearned words.

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
Submit an answer for one card in the session.

**Request Body:**
```json
{
  "wordId": "uuid",
  "result": "correct | incorrect"
}
```

**Behavior:**
- Update word's `learned` status if `result === "correct"`.
- Award +5 XP per correct answer.
- Progress relevant quests (`q1`, `q2`).

**Response:**
```json
{
  "ok": true,
  "data": {
    "wordId": "uuid",
    "result": "correct",
    "xpAwarded": 5
  }
}
```

---

### `POST /api/sessions/:sessionId/complete`
Complete a session and receive final rewards.

**Request Body:**
```json
{
  "correct": 6,
  "total": 8
}
```

**Behavior:**
- Award bonus XP: `20 + correct * 2`.
- Award bonus coins: `10 + correct * 3`.
- Bump daily streak.
- Progress quest `q4` (played a game).
- Persist session record.

**Response:**
```json
{
  "ok": true,
  "data": {
    "sessionId": "uuid",
    "xpEarned": 32,
    "coinsEarned": 28,
    "correct": 6,
    "total": 8,
    "streakBumped": true,
    "newLevel": null
  }
}
```

---

    "pageSize": 10
  }
}
```

---

### `GET /api/sessions/:sessionId`
Get details of a specific session, including answers.

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

> **Context:** Supports the Header HUD, `/store` page (quests + shop), and streak tracking.

---

### `GET /api/gamification`
Get the full gamification state for the current user.

**Response:**
```json
{
  "ok": true,
  "data": {
    "xp": 320,
    "level": 3,
    "coins": 240,
    "streak": 5,
    "bestStreak": 12,
    "lastActiveDay": "2026-05-11",
    "quests": [<Quest>, ...],
    "inventory": ["streak-freeze", "theme-ocean"]
  }
}
```

---

### `GET /api/gamification/quests`
Get the user's current daily quests (assigned for today).

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
        "title": "Quick Learner",
        "description": "Learn 20 new words today",
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
Claim the reward for a completed quest.

**Validation:** `user_quest` must belong to current user, be completed, and not already claimed.

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

```

---

### `GET /api/gamification/shop`
Get the master catalogue of shop items.

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
Get the user's current inventory (owned items).

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
Get the history of XP and Coin transactions.

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
```

**Error cases:**
- `INSUFFICIENT_COINS` — Not enough coins.
- `ALREADY_OWNED` — Already owns this item (cosmetic/content).
- `ITEM_NOT_FOUND` — Invalid item ID.

---

### `GET /api/gamification/badges`
Get the user's earned badges and the total list of available badges.

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
        "description": "Add your first word",
        "iconUrl": "...",
        "rarity": "common"
      }
    ]
  }
}
```

---

### `POST /api/gamification/streak/bump`
Manually bump the daily streak (called on session complete if not already bumped today).

> **Note:** This is typically called internally by `POST /api/sessions/:sessionId/complete`. Expose as a separate endpoint only if needed.

**Response:**
```json
{
  "ok": true,
  "data": {
    "streak": 6,
    "bestStreak": 12,
    "lastActiveDay": "2026-05-11"
  }
}
```

---

## 7. Leaderboard APIs

> **Context:** Supports the `/leaderboard` page (currently placeholder, "coming soon").

---

### `GET /api/leaderboard`
Get the global leaderboard, paginated.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `period` | `weekly\|monthly\|alltime` | `weekly` | Ranking period |
| `metric` | `xp\|streak\|words` | `xp` | Ranking metric |
| `page` | number | `1` | Page |
| `pageSize` | number | `20` | Items per page |

**Response:**
```json
{
  "ok": true,
  "data": {
    "period": "weekly",
    "metric": "xp",
    "entries": [
      {
        "rank": 1,
        "userId": "uuid",
        "name": "Nguyễn Minh Anh",
        "initials": "MA",
        "level": 5,
        "xp": 1200,
        "streak": 14,
        "wordsLearned": 240,
        "isCurrentUser": false
      }
    ],
    "currentUserRank": {
      "rank": 42,
      "xp": 320
    },
    "total": 1000
  }
}
```

---

### `GET /api/leaderboard/friends`
Get the leaderboard restricted to friends/followed users.

**Response:** Same shape as `GET /api/leaderboard`.

---

## 8. Admin APIs

> **Context:** Supports the `/admin` page.  
> **Required role:** `admin`

---

### `GET /api/admin/users`
List all users with basic info and stats.

**Query Parameters:** `q`, `page`, `pageSize`, `plan` (`free|pro|all`)

**Response:**
```json
{
  "ok": true,
  "data": {
    "items": [
      {
        "userId": "uuid",
        "name": "string",
        "email": "string",
        "plan": "free | pro",
        "level": 3,
        "wordsCount": 120,
        "streak": 5,
        "createdAt": "ISO datetime",
        "lastActiveAt": "ISO datetime"
      }
    ],
    "total": 500,
    "page": 1,
    "pageSize": 20
  }
}
```

---

### `GET /api/admin/words`
List all words across all users (global word bank management).

**Query Parameters:** `q`, `type`, `status`, `page`, `pageSize`

**Response:** Same shape as `GET /api/words` but across all users, with `userId` field.

---

### `POST /api/admin/words`
Add a word to the global word bank.

**Request Body:** Same as `POST /api/words`.

**Response:** `{ "ok": true, "data": <Word> }`

---

### `PUT /api/admin/words/:wordId`
Update a global word bank entry.

**Response:** `{ "ok": true, "data": <Word> }`

---

### `DELETE /api/admin/words/:wordId`
Delete a word from the global bank.

**Response:** `{ "ok": true }`

---

### `GET /api/admin/stats`
Get platform-wide statistics.

**Response:**
```json
{
  "ok": true,
  "data": {
    "totalUsers": 1200,
    "activeUsersToday": 340,
    "totalWords": 8500,
    "totalSessions": 45000,
    "totalXpAwarded": 2800000
  }
}
```

---

## 9. Database Schema

> **Design notes:**
> - `dictionary_words` is the global word bank (shared across system and users).
> - `user_words` tracks individual user progress (learned status, mastery level, review counts) for words in the dictionary.
> - `vocab_sets` is an **admin-owned global catalogue**. Each set has a `coin_price`; price = 0 means free.
> - `user_vocab_sets` tracks which user has unlocked which set (after paying the coin price).
> - `user_logins` stores login history (IP, User Agent) for security and analytics.
> - `quest_templates` stores the master list of possible daily quests.
> - `user_quests` tracks daily progress for each user's assigned quests.
> - `shop_items` is the global catalogue of items (streak freeze, themes, etc.).
> - `user_inventory_items` tracks ownership and quantity of purchased items.
> - `gamification` retains `streak`, `best_streak`, and `last_active_day`. `xp`, `coins`, and `level` are moved to `users` to avoid a join on every page load.

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
-- USERS
-- ============================================================
CREATE TABLE users (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT        NOT NULL,
  email          TEXT        UNIQUE NOT NULL,
  password_hash  TEXT        NOT NULL,
  plan           user_plan   NOT NULL DEFAULT 'free',
  -- Denormalized gamification counters (kept in sync on every award/spend)
  xp             INT         NOT NULL DEFAULT 0,
  level          INT         NOT NULL DEFAULT 1,
  coins          INT         NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at     TIMESTAMPTZ           -- NULL = active; non-NULL = soft-deleted
);

-- Index for active-user queries
CREATE INDEX idx_users_active ON users (id) WHERE deleted_at IS NULL;

-- ============================================================
-- USER LOGINS (for analytics & security)
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
-- DICTIONARY WORDS (global word bank)
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
-- USER WORDS (personal progress tracking)
-- ============================================================
CREATE TABLE user_words (
  user_id           UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  word_id           UUID        NOT NULL REFERENCES dictionary_words(id) ON DELETE CASCADE,
  
  -- Basic progress
  learned           BOOLEAN     NOT NULL DEFAULT FALSE,
  mastery           SMALLINT    NOT NULL DEFAULT 0 CHECK (mastery BETWEEN 0 AND 100),
  
  -- SRS Engine (e.g., SM-2 algorithm)
  ease_factor       REAL        NOT NULL DEFAULT 2.5,
  interval_days     INT         NOT NULL DEFAULT 0,
  review_count      INT         NOT NULL DEFAULT 0, -- repetitions
  
  next_review_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_reviewed_at  TIMESTAMPTZ,
  
  PRIMARY KEY (user_id, word_id)
);

CREATE INDEX idx_user_words_user ON user_words (user_id);
CREATE INDEX idx_user_words_word ON user_words (word_id);
CREATE INDEX idx_user_words_next_review ON user_words (next_review_at) WHERE learned = FALSE;

-- ============================================================
-- VOCAB SETS  (admin-published global catalogue)
-- ============================================================
CREATE TABLE vocab_sets (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  -- NULL = system/admin set; non-NULL = user-created set
  created_by    UUID        REFERENCES users(id) ON DELETE SET NULL,
  title         TEXT        NOT NULL,
  description   TEXT,
  color         TEXT        NOT NULL DEFAULT 'from-green-400 to-emerald-500',
  coin_price    INT         NOT NULL DEFAULT 0 CHECK (coin_price >= 0),
  is_system     BOOLEAN     NOT NULL DEFAULT FALSE, -- TRUE = official system set
  is_public     BOOLEAN     NOT NULL DEFAULT TRUE,  -- TRUE = visible in catalogue
  status        publish_status NOT NULL DEFAULT 'published',
  difficulty    SMALLINT    CHECK (difficulty BETWEEN 1 AND 5),
  tags          TEXT[]      DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vocab_sets_public ON vocab_sets (is_public, status);
CREATE INDEX idx_vocab_sets_system ON vocab_sets (is_system);

-- ============================================================
-- TRIGGERS (Auto-update updated_at)
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

-- Vocab Set → Words (join table, shared across all users)
CREATE TABLE vocab_set_words (
  vocab_set_id  UUID NOT NULL REFERENCES vocab_sets(id) ON DELETE CASCADE,
  word_id       UUID NOT NULL REFERENCES dictionary_words(id) ON DELETE CASCADE,
  PRIMARY KEY (vocab_set_id, word_id)
);

-- ============================================================
-- USER VOCAB SETS  (tracks which user has unlocked which set)
-- ============================================================
-- A user can unlock a set by paying its coin_price.
-- If coin_price = 0, it can still be explicitly "unlocked" (added to library).
CREATE TABLE user_vocab_sets (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        NOT NULL REFERENCES users(id)      ON DELETE CASCADE,
  vocab_set_id   UUID        NOT NULL REFERENCES vocab_sets(id) ON DELETE CASCADE,
  coins_paid     INT         NOT NULL DEFAULT 0 CHECK (coins_paid >= 0),
  progress_percent SMALLINT  NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  is_favorite    BOOLEAN     NOT NULL DEFAULT FALSE,
  unlocked_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at   TIMESTAMPTZ,
  UNIQUE (user_id, vocab_set_id)  -- a user can only unlock a set once
);

CREATE INDEX idx_user_vocab_sets_user ON user_vocab_sets (user_id);

-- ============================================================
-- PRACTICE SESSIONS
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
-- SESSION ANSWERS (Detailed response tracking)
-- ============================================================
CREATE TABLE session_answers (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id       UUID        NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  word_id          UUID        NOT NULL REFERENCES dictionary_words(id) ON DELETE CASCADE,
  is_correct       BOOLEAN     NOT NULL,
  response_time_ms INT,        -- time taken to answer in milliseconds
  user_answer      TEXT,       -- what the user actually typed/selected
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- GAMIFICATION STATE  (streak, inventory — one row per user)
-- NOTE: xp / level / coins live on users table for fast reads.
-- ============================================================
CREATE TABLE gamification (
  user_id         UUID    PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  streak          INT     NOT NULL DEFAULT 0,
  best_streak     INT     NOT NULL DEFAULT 0,
  last_active_day DATE
);

-- ============================================================
-- QUEST TEMPLATES (Master pool of potential quests)
-- ============================================================
CREATE TABLE quest_templates (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_key     TEXT        UNIQUE NOT NULL, -- e.g., 'learn_20', 'review_10'
  title         TEXT        NOT NULL,
  description   TEXT,
  goal          INT         NOT NULL, -- target count (words, sessions, etc.)
  reward_xp     INT         NOT NULL DEFAULT 0,
  reward_coins  INT         NOT NULL DEFAULT 0,
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- USER QUESTS (Daily instances assigned to users)
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
-- SHOP ITEMS (Master catalogue)
-- ============================================================
CREATE TABLE shop_items (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  item_key      TEXT        UNIQUE NOT NULL, -- e.g., 'streak_freeze', 'theme_ocean'
  title         TEXT        NOT NULL,
  description   TEXT,
  price         INT         NOT NULL CHECK (price >= 0),
  item_type     item_type   NOT NULL,
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- USER INVENTORY (Owned items)
-- ============================================================
CREATE TABLE user_inventory_items (
  user_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id       UUID        NOT NULL REFERENCES shop_items(id) ON DELETE CASCADE,
  quantity      INT         NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  purchased_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, item_id)
);

-- ============================================================
-- BADGES (Master list)
-- ============================================================
CREATE TABLE badges (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_key     TEXT        UNIQUE NOT NULL, -- e.g., 'first_word', 'streak_7', 'vocab_master'
  title         TEXT        NOT NULL,
  description   TEXT,
  icon_url      TEXT,
  rarity        TEXT        NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- USER BADGES (Earned by users)
-- ============================================================
CREATE TABLE user_badges (
  user_id       UUID        NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  badge_id      UUID        NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);

-- ============================================================
-- ECONOMY TRANSACTIONS (Audit log for XP and Coins)
-- ============================================================
CREATE TABLE economy_transactions (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type          TEXT        NOT NULL CHECK (type IN ('earn', 'spend')),
  currency      TEXT        NOT NULL CHECK (currency IN ('xp', 'coins')),
  amount        INT         NOT NULL,
  source        TEXT        NOT NULL, -- 'quest' | 'session' | 'shop' | 'admin'
  reference_id  UUID,       -- ID of the related quest_id, session_id, or shop_item_id
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_economy_transactions_user ON economy_transactions (user_id);
```

---

## 10. Implementation Priority

| Priority | Module | APIs |
|----------|--------|------|
| 🔴 P0 (Critical) | Auth | Register, Login, Logout, Me |
| 🔴 P0 (Critical) | Words | List, Create, Delete, Toggle Learned, Stats |
| 🔴 P0 (Critical) | Gamification | Get state, Quest claim, Shop redeem |
| 🟡 P1 (High) | Vocab Sets | CRUD, word association |
| 🟡 P1 (High) | Sessions | Create, Answer, Complete |
| 🟢 P2 (Medium) | Words | Bulk import, Update |
| 🟢 P2 (Medium) | Sessions | History |
| 🔵 P3 (Low) | Leaderboard | Global ranking |
| 🔵 P3 (Low) | Admin | User management, Global word bank, Stats |

---

*Generated: 2026-05-11 | Based on VocabLab UI Docs v1.0*
