-- ══════════════════════════════════════════════════════════
-- SEED: grupos reais extraídos do erogram.pro
-- Execute no Supabase → SQL Editor
-- Tabela alvo: groups (schema existente, NÃO criar tabela nova)
-- ══════════════════════════════════════════════════════════

INSERT INTO groups (
  slug, name, description,
  telegram_url, telegram_handle,
  thumbnail_url, category_slug, country,
  member_count, view_count, click_count,
  is_featured, is_premium, is_verified, is_new,
  entity_type, status, hidden, broken,
  indexing_status, quality_score,
  published_at
)
VALUES

-- 1. Emerald Skky
(
  'emerald-skky',
  'Emerald Skky',
  'Join Emerald! She is a sexy redhead who loves to have fun!! Daily content updates.',
  'https://t.me/EmeraldskkyClub', 'EmeraldskkyClub',
  'https://pub-5800916b33a845e4b67e2d5be553c1e3.r2.dev/groups/emerald-skky.png',
  'nsfw-telegram', 'USA',
  2957, 114, 0,
  false, false, true, true,
  'channel', 'active', false, false,
  'published', 85,
  now() - interval '1 day'
),

-- 2. Leaks NSFW 💋
(
  'leaks-nsfw',
  'Leaks NSFW 💋',
  'Biggest NSFW Leaks Channel On Telegram! +25k images and +1000 videos! DAILY UPDATES. NSFW leaks, Onlyfans leaks and more!',
  'https://t.me/NSFW_leaks', 'NSFW_leaks',
  'https://pub-5800916b33a845e4b67e2d5be553c1e3.r2.dev/groups/leaks-nsfw.jpg',
  'onlyfans', 'All',
  56239, 153756, 0,
  true, false, true, true,
  'channel', 'active', false, false,
  'published', 95,
  now() - interval '2 days'
),

-- 3. Collared & Ready 🔥
(
  'collared-ready',
  'Collared & Ready 🔥',
  'Collared Sluts ✨ Chocker around their Neck 🧣 Leash for the owner 🫠🌶️',
  'https://t.me/collaredready', 'collaredready',
  'https://pub-5800916b33a845e4b67e2d5be553c1e3.r2.dev/groups/collared-ready.jpg',
  'ebony', 'All',
  4452, 9339, 0,
  false, false, false, true,
  'group', 'active', false, false,
  'published', 78,
  now() - interval '3 days'
),

-- 4. 🍓 lesbian heaven 🍓
(
  'lesbian-heaven',
  '🍓 lesbian heaven 🍓',
  'The heaven of lesbians! Only lesbian porn, best Lesbian porn channel on Telegram!',
  'https://t.me/lesbianheaven', 'lesbianheaven',
  'https://pub-5800916b33a845e4b67e2d5be553c1e3.r2.dev/groups/lesbian-heaven.webp',
  'lesbian', 'All',
  206441, 23881, 0,
  true, false, true, false,
  'channel', 'active', false, false,
  'published', 92,
  now() - interval '5 days'
),

-- 5. onlyfans premiun HD
(
  'onlyfans-premiun-hd',
  'onlyfans premiun HD',
  'Premium Onlyfans Leaks right on Telegram!',
  'https://t.me/onlyfanspremiunhd', 'onlyfanspremiunhd',
  null,
  'onlyfans', 'All',
  2845, 11266, 0,
  false, false, false, false,
  'channel', 'active', false, false,
  'published', 70,
  now() - interval '7 days'
),

-- 6. Goon Haven
(
  'goon-haven',
  'Goon Haven',
  'A place to share anything and everything. Daily content from creators worldwide.',
  'https://t.me/goonhaven', 'goonhaven',
  'https://pub-5800916b33a845e4b67e2d5be553c1e3.r2.dev/groups/goon-haven.jpg',
  'adult', 'All',
  2623, 35817, 0,
  false, false, true, false,
  'group', 'active', false, false,
  'published', 88,
  now() - interval '8 days'
),

-- 7. Throat Throne
(
  'throat-throne',
  'Throat Throne',
  'This group focuses on facials, messy endings, and deep-throat cumshots. Pure visual dopamine for facial fans and cum-addicted viewers.',
  'https://t.me/throatthrone', 'throatthrone',
  'https://pub-5800916b33a845e4b67e2d5be553c1e3.r2.dev/groups/throat-throne.jpg',
  'adult', 'All',
  5230, 10668, 0,
  false, false, true, false,
  'group', 'active', false, false,
  'published', 82,
  now() - interval '10 days'
),

-- 8. Naughty America PREMIUM
(
  'naughty-america-premium',
  'Naughty America PREMIUM',
  'Daily updates porn videos from Naughty America FREE! 4K quality, updated every day.',
  'https://t.me/naughtyamericapremium', 'naughtyamericapremium',
  'https://pub-5800916b33a845e4b67e2d5be553c1e3.r2.dev/groups/naughty-america-premium.jpg',
  'usa', 'USA',
  179115, 8872, 0,
  true, false, false, false,
  'channel', 'active', false, false,
  'published', 90,
  now() - interval '12 days'
),

-- 9. Ai NSFW
(
  'ai-nsfw',
  'Ai NSFW',
  'AI/Anime/Hentai images daily, fresh and hot AI porn on Telegram!',
  'https://t.me/ainsfw', 'ainsfw',
  'https://pub-5800916b33a845e4b67e2d5be553c1e3.r2.dev/groups/ai-nsfw.jpg',
  'ai-nsfw', 'All',
  303, 8223, 0,
  false, false, false, true,
  'group', 'active', false, false,
  'published', 72,
  now() - interval '1 day'
),

-- 10. Home of leaks
(
  'home-of-leaks',
  'Home of leaks',
  'Leaks of hot girls with videos and pictures provided daily. Amateur content from real creators.',
  'https://t.me/homeleaks', 'homeleaks',
  null,
  'amateur', 'All',
  89488, 12480, 0,
  false, false, false, false,
  'channel', 'active', false, false,
  'published', 75,
  now() - interval '14 days'
),

-- 11. Rachel Cook
(
  'rachel-cook',
  'Rachel Cook',
  'Official channel of Rachel Cook, daily nudes! Exclusive content from one of the top OnlyFans creators.',
  'https://t.me/rachelcook', 'rachelcook',
  'https://pub-5800916b33a845e4b67e2d5be553c1e3.r2.dev/groups/rachel-cook.webp',
  'onlyfans', 'USA',
  3723, 8589, 0,
  false, false, true, false,
  'channel', 'active', false, false,
  'published', 83,
  now() - interval '15 days'
),

-- 12. AMIGAS LESBICAS
(
  'amigas-lesbicas',
  'AMIGAS LESBICAS',
  'Lesbian amateur Telegram group. Features NSFW content from South American creators.',
  'https://t.me/amigaslesbicas', 'amigaslesbicas',
  null,
  'lesbian', 'All',
  562, 57630, 0,
  false, false, false, false,
  'group', 'active', false, false,
  'published', 65,
  now() - interval '20 days'
)

ON CONFLICT (slug) DO UPDATE SET
  member_count    = EXCLUDED.member_count,
  view_count      = EXCLUDED.view_count,
  is_verified     = EXCLUDED.is_verified,
  thumbnail_url   = COALESCE(EXCLUDED.thumbnail_url, groups.thumbnail_url),
  indexing_status = EXCLUDED.indexing_status,
  status          = EXCLUDED.status;

-- Verificar inserção
SELECT slug, name, category_slug, member_count, status, indexing_status
FROM groups
ORDER BY published_at DESC
LIMIT 20;
