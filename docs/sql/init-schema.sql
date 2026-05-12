-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'word_type') THEN
        CREATE TYPE word_type AS ENUM ('NOUN', 'VERB', 'ADJ', 'ADV');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_plan') THEN
        CREATE TYPE user_plan AS ENUM ('free', 'pro');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'publish_status') THEN
        CREATE TYPE publish_status AS ENUM ('draft', 'published');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'game_mode') THEN
        CREATE TYPE game_mode AS ENUM ('flashcard', 'quiz', 'match', 'typing');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'item_type') THEN
        CREATE TYPE item_type AS ENUM ('consumable', 'cosmetic', 'content');
    END IF;
END $$;

-- ============================================================
-- USERS — Người dùng
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT,
  email          TEXT        UNIQUE,
  email_verified TIMESTAMPTZ,
  image          TEXT,
  password_hash  TEXT,
  plan           user_plan   NOT NULL DEFAULT 'free',
  xp             INT         NOT NULL DEFAULT 0,
  level          INT         NOT NULL DEFAULT 1,
  coins          INT         NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at     TIMESTAMPTZ
);

-- Index cho truy vấn user đang hoạt động
CREATE INDEX IF NOT EXISTS idx_users_active ON users (id) WHERE deleted_at IS NULL;

-- ============================================================
-- AUTH TABLES (NextAuth / Better Auth compatible)
-- ============================================================
CREATE TABLE IF NOT EXISTS accounts (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"            UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type                TEXT        NOT NULL,
  provider            TEXT        NOT NULL,
  "providerAccountId" TEXT        NOT NULL,
  refresh_token       TEXT,
  access_token        TEXT,
  expires_at          INT,
  token_type          TEXT,
  scope               TEXT,
  id_token            TEXT,
  session_state       TEXT,
  UNIQUE (provider, "providerAccountId")
);

CREATE TABLE IF NOT EXISTS auth_sessions (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  "sessionToken" TEXT       UNIQUE NOT NULL,
  "userId"      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires       TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier TEXT NOT NULL,
  token      TEXT UNIQUE NOT NULL,
  expires    TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- ============================================================
-- USER LOGINS — Lịch sử đăng nhập
-- ============================================================
CREATE TABLE IF NOT EXISTS user_logins (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ip_address     TEXT,
  user_agent     TEXT,
  logged_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_logins_user ON user_logins (user_id);
CREATE INDEX IF NOT EXISTS idx_user_logins_date ON user_logins (logged_at);

-- ============================================================
-- DICTIONARY WORDS — Ngân hàng từ vựng toàn cục
-- ============================================================
CREATE TABLE IF NOT EXISTS dictionary_words (
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
CREATE TABLE IF NOT EXISTS user_words (
  user_id           UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  word_id           UUID        NOT NULL REFERENCES dictionary_words(id) ON DELETE CASCADE,
  learned           BOOLEAN     NOT NULL DEFAULT FALSE,
  mastery           SMALLINT    NOT NULL DEFAULT 0 CHECK (mastery BETWEEN 0 AND 100),
  ease_factor       REAL        NOT NULL DEFAULT 2.5,
  interval_days     INT         NOT NULL DEFAULT 0,
  review_count      INT         NOT NULL DEFAULT 0,
  next_review_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_reviewed_at  TIMESTAMPTZ,
  PRIMARY KEY (user_id, word_id)
);

CREATE INDEX IF NOT EXISTS idx_user_words_user ON user_words (user_id);
CREATE INDEX IF NOT EXISTS idx_user_words_word ON user_words (word_id);
CREATE INDEX IF NOT EXISTS idx_user_words_next_review ON user_words (next_review_at) WHERE learned = FALSE;

-- ============================================================
-- VOCAB SETS — Bộ từ vựng
-- ============================================================
CREATE TABLE IF NOT EXISTS vocab_sets (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by    UUID        REFERENCES users(id) ON DELETE SET NULL,
  title         TEXT        NOT NULL,
  description   TEXT,
  color         TEXT        NOT NULL DEFAULT 'from-green-400 to-emerald-500',
  coin_price    INT         NOT NULL DEFAULT 0 CHECK (coin_price >= 0),
  is_system     BOOLEAN     NOT NULL DEFAULT FALSE,
  is_public     BOOLEAN     NOT NULL DEFAULT TRUE,
  status        publish_status NOT NULL DEFAULT 'published',
  difficulty    SMALLINT    CHECK (difficulty BETWEEN 1 AND 5),
  tags          TEXT[]      DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vocab_sets_public ON vocab_sets (is_public, status);
CREATE INDEX IF NOT EXISTS idx_vocab_sets_system ON vocab_sets (is_system);

-- Quan hệ Bộ từ ↔ Từ vựng
CREATE TABLE IF NOT EXISTS vocab_set_words (
  vocab_set_id  UUID NOT NULL REFERENCES vocab_sets(id) ON DELETE CASCADE,
  word_id       UUID NOT NULL REFERENCES dictionary_words(id) ON DELETE CASCADE,
  PRIMARY KEY (vocab_set_id, word_id)
);

-- ============================================================
-- USER VOCAB SETS — Bộ từ user đã mở khóa
-- ============================================================
CREATE TABLE IF NOT EXISTS user_vocab_sets (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vocab_set_id     UUID        NOT NULL REFERENCES vocab_sets(id) ON DELETE CASCADE,
  coins_paid       INT         NOT NULL DEFAULT 0 CHECK (coins_paid >= 0),
  progress_percent SMALLINT    NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  is_favorite      BOOLEAN     NOT NULL DEFAULT FALSE,
  unlocked_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at     TIMESTAMPTZ,
  UNIQUE (user_id, vocab_set_id)
);

CREATE INDEX IF NOT EXISTS idx_user_vocab_sets_user ON user_vocab_sets (user_id);

-- ============================================================
-- SESSIONS — Phiên luyện tập
-- ============================================================
CREATE TABLE IF NOT EXISTS sessions (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_mode        game_mode   NOT NULL,
  correct          INT         NOT NULL DEFAULT 0,
  total            INT         NOT NULL DEFAULT 0,
  xp_earned        INT         NOT NULL DEFAULT 0,
  coins_earned     INT         NOT NULL DEFAULT 0,
  duration_seconds INT         NOT NULL DEFAULT 0,
  started_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at     TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions (user_id);

-- ============================================================
-- SESSION ANSWERS — Chi tiết câu trả lời
-- ============================================================
CREATE TABLE IF NOT EXISTS session_answers (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id       UUID        NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  word_id          UUID        NOT NULL REFERENCES dictionary_words(id) ON DELETE CASCADE,
  is_correct       BOOLEAN     NOT NULL,
  response_time_ms INT,
  user_answer      TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- GAMIFICATION — Trạng thái streak
-- ============================================================
CREATE TABLE IF NOT EXISTS gamification (
  user_id         UUID    PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  streak          INT     NOT NULL DEFAULT 0,
  best_streak     INT     NOT NULL DEFAULT 0,
  last_active_day DATE
);

-- ============================================================
-- QUEST TEMPLATES — Danh mục nhiệm vụ mẫu
-- ============================================================
CREATE TABLE IF NOT EXISTS quest_templates (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_key     TEXT        UNIQUE NOT NULL,
  title         TEXT        NOT NULL,
  description   TEXT,
  goal          INT         NOT NULL,
  reward_xp     INT         NOT NULL DEFAULT 0,
  reward_coins  INT         NOT NULL DEFAULT 0,
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- USER QUESTS — Nhiệm vụ hằng ngày của user
-- ============================================================
CREATE TABLE IF NOT EXISTS user_quests (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template_id   UUID        NOT NULL REFERENCES quest_templates(id) ON DELETE CASCADE,
  progress      INT         NOT NULL DEFAULT 0,
  completed     BOOLEAN     NOT NULL DEFAULT FALSE,
  claimed       BOOLEAN     NOT NULL DEFAULT FALSE,
  assigned_date DATE        NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE (user_id, template_id, assigned_date)
);

CREATE INDEX IF NOT EXISTS idx_user_quests_user_date ON user_quests (user_id, assigned_date);

-- ============================================================
-- SHOP ITEMS — Danh mục vật phẩm shop
-- ============================================================
CREATE TABLE IF NOT EXISTS shop_items (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  item_key      TEXT        UNIQUE NOT NULL,
  title         TEXT        NOT NULL,
  description   TEXT,
  price         INT         NOT NULL CHECK (price >= 0),
  item_type     item_type   NOT NULL,
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- USER INVENTORY — Kho đồ của người dùng
-- ============================================================
CREATE TABLE IF NOT EXISTS user_inventory_items (
  user_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id       UUID        NOT NULL REFERENCES shop_items(id) ON DELETE CASCADE,
  quantity      INT         NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  purchased_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, item_id)
);

-- ============================================================
-- BADGES — Danh sách huy hiệu
-- ============================================================
CREATE TABLE IF NOT EXISTS badges (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_key     TEXT        UNIQUE NOT NULL,
  title         TEXT        NOT NULL,
  description   TEXT,
  icon_url      TEXT,
  rarity        TEXT        NOT NULL DEFAULT 'common',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- USER BADGES — Huy hiệu user đạt được
-- ============================================================
CREATE TABLE IF NOT EXISTS user_badges (
  user_id       UUID        NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  badge_id      UUID        NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);

-- ============================================================
-- ECONOMY TRANSACTIONS — Nhật ký giao dịch
-- ============================================================
CREATE TABLE IF NOT EXISTS economy_transactions (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type          TEXT        NOT NULL CHECK (type IN ('earn', 'spend')),
  currency      TEXT        NOT NULL CHECK (currency IN ('xp', 'coins')),
  amount        INT         NOT NULL,
  source        TEXT        NOT NULL,
  reference_id  UUID,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_economy_transactions_user ON economy_transactions (user_id);

-- ============================================================
-- TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS tr_users_updated_at ON users;
CREATE TRIGGER tr_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS tr_dictionary_words_updated_at ON dictionary_words;
CREATE TRIGGER tr_dictionary_words_updated_at BEFORE UPDATE ON dictionary_words FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS tr_vocab_sets_updated_at ON vocab_sets;
CREATE TRIGGER tr_vocab_sets_updated_at BEFORE UPDATE ON vocab_sets FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS tr_shop_items_updated_at ON shop_items;
CREATE TRIGGER tr_shop_items_updated_at BEFORE UPDATE ON shop_items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
