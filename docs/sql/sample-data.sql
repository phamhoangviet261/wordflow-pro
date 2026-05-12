-- ============================================================
-- SAMPLE DATA FOR VOCABLAB
-- Created: 2026-05-12
-- ============================================================

-- 1. DICTIONARY WORDS
-- We use DO blocks or variables to capture IDs if needed, 
-- but for a simple seed, we'll use fixed UUIDs for reliability in relations.

INSERT INTO dictionary_words (id, word, phonetic, meaning, type, example, difficulty, tags) VALUES
('d1eb93a1-7ae5-48ad-9e6e-260f511d0b3a', 'abandon', '/əˈbændən/', 'từ bỏ, bỏ rơi', 'VERB', 'He abandoned his car in the snow.', 2, '{IELTS, Academic}'),
('d1eb93a1-7ae5-48ad-9e6e-260f511d0b3b', 'benevolent', '/bəˈnevələnt/', 'nhân từ, rộng lượng', 'ADJ', 'A benevolent smile lit up his face.', 4, '{Academic, Advanced}'),
('d1eb93a1-7ae5-48ad-9e6e-260f511d0b3c', 'calculate', '/ˈkælkjuleɪt/', 'tính toán', 'VERB', 'We need to calculate the costs.', 1, '{Daily, Math}'),
('d1eb93a1-7ae5-48ad-9e6e-260f511d0b3d', 'diligent', '/ˈdɪlɪdʒənt/', 'siêng năng, cần cù', 'ADJ', 'She is a diligent student.', 2, '{IELTS, Work}'),
('d1eb93a1-7ae5-48ad-9e6e-260f511d0b3e', 'eloquent', '/ˈeləkwənt/', 'hùng hồn, có tài hùng biện', 'ADJ', 'He made an eloquent speech.', 4, '{Academic, Speaking}'),
('d1eb93a1-7ae5-48ad-9e6e-260f511d0b3f', 'facilitate', '/fəˈsɪlɪteɪt/', 'tạo điều kiện thuận lợi', 'VERB', 'The new ramp will facilitate the entry of wheelchairs.', 3, '{Academic, Formal}'),
('d1eb93a1-7ae5-48ad-9e6e-260f511d0b40', 'gorgeous', '/ˈɡɔːrdʒəs/', 'tuyệt đẹp, rạng rỡ', 'ADJ', 'You look gorgeous in that dress!', 1, '{Daily, Casual}'),
('d1eb93a1-7ae5-48ad-9e6e-260f511d0b41', 'hypothesis', '/haɪˈpɒθəsɪs/', 'giả thuyết', 'NOUN', 'The results confirm my hypothesis.', 5, '{Academic, Research}'),
('d1eb93a1-7ae5-48ad-9e6e-260f511d0b42', 'inevitable', '/ɪnˈevɪtəbl/', 'không thể tránh khỏi', 'ADJ', 'Change is inevitable.', 3, '{Academic, General}'),
('d1eb93a1-7ae5-48ad-9e6e-260f511d0b43', 'justify', '/ˈdʒʌstɪfaɪ/', 'bào chữa, thanh minh', 'VERB', 'How can you justify your behavior?', 3, '{Academic, Logic}')
ON CONFLICT (word, type) DO NOTHING;

-- 2. VOCAB SETS
INSERT INTO vocab_sets (id, title, description, color, coin_price, is_system, is_public, status, difficulty, tags) VALUES
('01eb93a1-7ae5-48ad-9e6e-260f511d0b3a', 'IELTS Essential Academic', 'Must-know words for IELTS Reading and Writing.', 'from-blue-400 to-indigo-500', 0, true, true, 'published', 4, '{IELTS, Academic}'),
('01eb93a1-7ae5-48ad-9e6e-260f511d0b3b', 'Daily Communication', 'Common words used in everyday English conversations.', 'from-green-400 to-emerald-500', 0, true, true, 'published', 1, '{Daily, Casual}'),
('01eb93a1-7ae5-48ad-9e6e-260f511d0b3c', 'Business English Pro', 'Advance your career with professional vocabulary.', 'from-purple-400 to-pink-500', 150, true, true, 'published', 3, '{Business, Professional}')
ON CONFLICT (id) DO NOTHING;

-- 3. VOCAB SET WORDS (Mapping)
INSERT INTO vocab_set_words (vocab_set_id, word_id) VALUES
-- IELTS Set
('01eb93a1-7ae5-48ad-9e6e-260f511d0b3a', 'd1eb93a1-7ae5-48ad-9e6e-260f511d0b3a'),
('01eb93a1-7ae5-48ad-9e6e-260f511d0b3a', 'd1eb93a1-7ae5-48ad-9e6e-260f511d0b3b'),
('01eb93a1-7ae5-48ad-9e6e-260f511d0b3a', 'd1eb93a1-7ae5-48ad-9e6e-260f511d0b3e'),
('01eb93a1-7ae5-48ad-9e6e-260f511d0b3a', 'd1eb93a1-7ae5-48ad-9e6e-260f511d0b3f'),
('01eb93a1-7ae5-48ad-9e6e-260f511d0b3a', 'd1eb93a1-7ae5-48ad-9e6e-260f511d0b41'),
-- Daily Set
('01eb93a1-7ae5-48ad-9e6e-260f511d0b3b', 'd1eb93a1-7ae5-48ad-9e6e-260f511d0b3c'),
('01eb93a1-7ae5-48ad-9e6e-260f511d0b3b', 'd1eb93a1-7ae5-48ad-9e6e-260f511d0b3d'),
('01eb93a1-7ae5-48ad-9e6e-260f511d0b3b', 'd1eb93a1-7ae5-48ad-9e6e-260f511d0b40'),
('01eb93a1-7ae5-48ad-9e6e-260f511d0b3b', 'd1eb93a1-7ae5-48ad-9e6e-260f511d0b42'),
-- Business Set
('01eb93a1-7ae5-48ad-9e6e-260f511d0b3c', 'd1eb93a1-7ae5-48ad-9e6e-260f511d0b3f'),
('01eb93a1-7ae5-48ad-9e6e-260f511d0b3c', 'd1eb93a1-7ae5-48ad-9e6e-260f511d0b43')
ON CONFLICT DO NOTHING;

-- 4. QUEST TEMPLATES
INSERT INTO quest_templates (id, quest_key, title, description, goal, reward_xp, reward_coins, is_active) VALUES
(gen_random_uuid(), 'learn_20', 'Học 20 từ mới', 'Hoàn thành các bài học từ vựng.', 20, 50, 30, true),
(gen_random_uuid(), 'review_10', 'Ôn 10 từ', 'Xem lại từ đã học bằng Flashcard.', 10, 30, 20, true),
(gen_random_uuid(), 'streak_5', 'Chuỗi 5 đúng', 'Trả lời chính xác 5 từ liên tiếp trong mini-game.', 5, 40, 25, true),
(gen_random_uuid(), 'play_game', 'Thử thách Game', 'Hoàn thành 1 ván game Flashcard hoặc Quiz.', 1, 25, 15, true)
ON CONFLICT (quest_key) DO NOTHING;

-- 5. SHOP ITEMS
INSERT INTO shop_items (id, item_key, title, description, price, item_type, is_active) VALUES
(gen_random_uuid(), 'streak_freeze', 'Streak Freeze', 'Bảo vệ streak của bạn 1 ngày khi không đăng nhập.', 60, 'consumable', true),
(gen_random_uuid(), 'theme_ocean', 'Giao diện Ocean', 'Đổi sang màu xanh đại dương dịu mắt.', 150, 'cosmetic', true),
(gen_random_uuid(), 'theme_sunset', 'Giao diện Sunset', 'Đổi sang tông màu hoàng hôn rực rỡ.', 150, 'cosmetic', true),
(gen_random_uuid(), 'pack_business', 'Bộ từ Business+', 'Mở khoá bộ từ vựng chuyên sâu cho doanh nghiệp.', 250, 'content', true),
(gen_random_uuid(), 'ai_explain', 'Giải thích AI', 'Nhận 5 lượt giải thích chi tiết ý nghĩa và ngữ cảnh từ AI.', 80, 'content', true)
ON CONFLICT (item_key) DO NOTHING;

-- 6. BADGES
INSERT INTO badges (id, badge_key, title, description, rarity) VALUES
(gen_random_uuid(), 'first_word', 'Bắt Đầu Hành Trình', 'Thêm từ vựng đầu tiên vào danh sách.', 'common'),
(gen_random_uuid(), 'streak_7', 'Kiên Trì 7 Ngày', 'Duy trì chuỗi học tập liên tục trong 1 tuần.', 'rare'),
(gen_random_uuid(), 'vocab_master', 'Bậc Thầy Từ Vựng', 'Học thuộc 1000 từ vựng.', 'legendary'),
(gen_random_uuid(), 'shop_addict', 'Khách Hàng Thân Thiết', 'Mua 5 vật phẩm trong cửa hàng.', 'rare')
ON CONFLICT (badge_key) DO NOTHING;
