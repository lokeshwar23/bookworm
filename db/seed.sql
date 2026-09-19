-- BookWorm Seed Data
-- Run via: node lib/migrate.js (executed after schema.sql)

-- ---------------------------------------------------------------------------
-- Categories (20)
-- ---------------------------------------------------------------------------
INSERT INTO categories (id, name, slug) VALUES
  (gen_random_uuid(), 'All',                      'all'),
  (gen_random_uuid(), 'Romance',                  'romance'),
  (gen_random_uuid(), 'Mystery',                  'mystery'),
  (gen_random_uuid(), 'Science Fiction',          'science-fiction'),
  (gen_random_uuid(), 'Fantasy',                  'fantasy'),
  (gen_random_uuid(), 'Historical',               'historical'),
  (gen_random_uuid(), 'Biography',                'biography'),
  (gen_random_uuid(), 'Self-Help',                'self-help'),
  (gen_random_uuid(), 'Memoir',                   'memoir'),
  (gen_random_uuid(), 'Travel',                   'travel'),
  (gen_random_uuid(), 'Cooking',                  'cooking'),
  (gen_random_uuid(), 'Children''s',              'childrens'),
  (gen_random_uuid(), 'Young Adult',              'young-adult'),
  (gen_random_uuid(), 'Comics & Graphic Novels',  'comics-graphic-novels'),
  (gen_random_uuid(), 'Poetry',                   'poetry'),
  (gen_random_uuid(), 'Drama',                    'drama'),
  (gen_random_uuid(), 'Science',                  'science'),
  (gen_random_uuid(), 'Philosophy',               'philosophy'),
  (gen_random_uuid(), 'Religion',                 'religion'),
  (gen_random_uuid(), 'Language Learning',        'language-learning')
ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Publishers (5)
-- ---------------------------------------------------------------------------
INSERT INTO publishers (id, name, slug) VALUES
  (gen_random_uuid(), 'Penguin Random House',  'penguin-random-house'),
  (gen_random_uuid(), 'HarperCollins',         'harpercollins'),
  (gen_random_uuid(), 'Simon & Schuster',      'simon-schuster'),
  (gen_random_uuid(), 'Macmillan Publishers',  'macmillan'),
  (gen_random_uuid(), 'Oxford University Press', 'oxford-university-press')
ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Books (35+)
-- We resolve publisher_id and category_id by slug at insert time.
-- ---------------------------------------------------------------------------

-- Self-Help
INSERT INTO books (title, author, publisher_id, category_id, price, format, language, cover_image_url, description, author_bio, rating, sales_count, delivery_days, stock, is_featured) VALUES
(
  'The Art of Focus',
  'Marcus Webb',
  (SELECT id FROM publishers WHERE slug = 'penguin-random-house'),
  (SELECT id FROM categories WHERE slug = 'self-help'),
  299.00, 'paperback', 'English',
  '/images/books/the-art-of-focus.jpg',
  'A practical guide to reclaiming your attention in the age of endless distraction.',
  'Marcus Webb is a productivity coach and bestselling author with over 15 years of experience.',
  4.7, 4200, 4, 120, true
),
(
  'The Art of Learning',
  'Josh Waitzkin',
  (SELECT id FROM publishers WHERE slug = 'simon-schuster'),
  (SELECT id FROM categories WHERE slug = 'self-help'),
  349.00, 'hardcover', 'English',
  '/images/books/the-art-of-learning.jpg',
  'A chess prodigy and martial arts champion shares his framework for mastering any skill.',
  'Josh Waitzkin is an eight-time US chess champion and Tai Chi Push Hands world champion.',
  4.8, 3900, 5, 80, true
),
(
  'The Path to Success',
  'Sandra Mills',
  (SELECT id FROM publishers WHERE slug = 'harpercollins'),
  (SELECT id FROM categories WHERE slug = 'self-help'),
  199.00, 'ebook', 'English',
  '/images/books/the-path-to-success.jpg',
  'Transform your mindset and unlock your full potential with proven strategies.',
  'Sandra Mills is a motivational speaker and life coach based in New York.',
  4.3, 2100, 3, 200, false
),
(
  'Joy of Minimalism',
  'Lena Hart',
  (SELECT id FROM publishers WHERE slug = 'macmillan'),
  (SELECT id FROM categories WHERE slug = 'self-help'),
  249.00, 'paperback', 'English',
  '/images/books/joy-of-minimalism.jpg',
  'Declutter your life, home, and mind for lasting peace and clarity.',
  'Lena Hart is a minimalism advocate and author of three international bestsellers.',
  4.5, 1800, 5, 90, false
),

-- Mystery
(
  'The Midnight Hour',
  'Eleanor Cross',
  (SELECT id FROM publishers WHERE slug = 'penguin-random-house'),
  (SELECT id FROM categories WHERE slug = 'mystery'),
  399.00, 'hardcover', 'English',
  '/images/books/the-midnight-hour.jpg',
  'Detective Claire Rowe races against the clock to stop a serial killer who strikes only at midnight.',
  'Eleanor Cross is a crime fiction author with a background in forensic psychology.',
  4.6, 5000, 4, 60, true
),
(
  'The Vanishing House',
  'Tom Aldridge',
  (SELECT id FROM publishers WHERE slug = 'simon-schuster'),
  (SELECT id FROM categories WHERE slug = 'mystery'),
  299.00, 'paperback', 'English',
  '/images/books/the-vanishing-house.jpg',
  'A family moves into their dream home — only for the neighbours to insist the house has never existed.',
  'Tom Aldridge writes psychological thrillers set in rural England.',
  4.4, 2800, 5, 75, false
),
(
  'Shadows Over Baker Street',
  'Priya Nair',
  (SELECT id FROM publishers WHERE slug = 'harpercollins'),
  (SELECT id FROM categories WHERE slug = 'mystery'),
  349.00, 'ebook', 'English',
  '/images/books/shadows-over-baker-street.jpg',
  'A modern reimagining of classic detective fiction fused with supernatural horror.',
  'Priya Nair is a Mumbai-based author of crime and gothic fiction.',
  4.2, 1500, 3, 150, false
),

-- Science Fiction
(
  'The Final Frontier',
  'Raj Mehta',
  (SELECT id FROM publishers WHERE slug = 'macmillan'),
  (SELECT id FROM categories WHERE slug = 'science-fiction'),
  449.00, 'hardcover', 'English',
  '/images/books/the-final-frontier.jpg',
  'Humanity''s last colony ship reaches the edge of the known universe and discovers it is not alone.',
  'Raj Mehta is a NASA engineer turned science fiction novelist.',
  4.9, 4800, 6, 50, true
),
(
  'Neon Horizon',
  'Chloe Vance',
  (SELECT id FROM publishers WHERE slug = 'penguin-random-house'),
  (SELECT id FROM categories WHERE slug = 'science-fiction'),
  299.00, 'ebook', 'English',
  '/images/books/neon-horizon.jpg',
  'In 2147, a rogue AI offers mankind immortality — at a price nobody anticipated.',
  'Chloe Vance writes cyberpunk and transhumanist fiction from Berlin.',
  4.5, 3200, 4, 110, false
),
(
  'Parallel Lives',
  'Omar Farouq',
  (SELECT id FROM publishers WHERE slug = 'oxford-university-press'),
  (SELECT id FROM categories WHERE slug = 'science-fiction'),
  399.00, 'paperback', 'English',
  '/images/books/parallel-lives.jpg',
  'When a physicist accidentally splits into two timelines, both versions must work together to prevent catastrophe.',
  'Omar Farouq is a theoretical physicist and award-winning short-story author.',
  4.6, 2600, 5, 85, false
),

-- Fantasy
(
  'Beneath the Stars',
  'Isla Morgan',
  (SELECT id FROM publishers WHERE slug = 'harpercollins'),
  (SELECT id FROM categories WHERE slug = 'fantasy'),
  499.00, 'hardcover', 'English',
  '/images/books/beneath-the-stars.jpg',
  'In a world where starlight grants magic, a young cartographer maps territories that should not exist.',
  'Isla Morgan is a fantasy author and professor of medieval literature.',
  4.8, 4500, 5, 65, true
),
(
  'The Iron Crown',
  'David Ashford',
  (SELECT id FROM publishers WHERE slug = 'simon-schuster'),
  (SELECT id FROM categories WHERE slug = 'fantasy'),
  449.00, 'paperback', 'English',
  '/images/books/the-iron-crown.jpg',
  'A blacksmith''s apprentice forges the legendary Iron Crown — and unwittingly triggers an ancient war.',
  'David Ashford has been writing epic fantasy for over two decades.',
  4.7, 3700, 6, 55, false
),
(
  'Whispers of the Ancients',
  'Fatima Al-Rashid',
  (SELECT id FROM publishers WHERE slug = 'macmillan'),
  (SELECT id FROM categories WHERE slug = 'fantasy'),
  349.00, 'ebook', 'English',
  '/images/books/whispers-of-the-ancients.jpg',
  'Three siblings inherit a crumbling desert palace and the thousand-year-old secrets buried beneath it.',
  'Fatima Al-Rashid draws on Arabian folklore for her richly imagined worlds.',
  4.4, 1900, 4, 130, false
),

-- Romance
(
  'Midnight in Montmartre',
  'Sophie Laurent',
  (SELECT id FROM publishers WHERE slug = 'penguin-random-house'),
  (SELECT id FROM categories WHERE slug = 'romance'),
  249.00, 'paperback', 'English',
  '/images/books/midnight-in-montmartre.jpg',
  'An aspiring painter falls for a brooding musician in the cobblestone streets of Paris.',
  'Sophie Laurent writes contemporary romance inspired by her years living in France.',
  4.3, 2300, 3, 140, false
),
(
  'Letters Never Sent',
  'Arjun Kapoor',
  (SELECT id FROM publishers WHERE slug = 'harpercollins'),
  (SELECT id FROM categories WHERE slug = 'romance'),
  199.00, 'ebook', 'English',
  '/images/books/letters-never-sent.jpg',
  'Two strangers begin exchanging handwritten letters and slowly fall in love — never having met.',
  'Arjun Kapoor is a Delhi-based author of literary romance.',
  4.5, 2900, 3, 175, true
),

-- Biography
(
  'A Life in Code',
  'Dr. Amina Osei',
  (SELECT id FROM publishers WHERE slug = 'oxford-university-press'),
  (SELECT id FROM categories WHERE slug = 'biography'),
  599.00, 'hardcover', 'English',
  '/images/books/a-life-in-code.jpg',
  'The extraordinary life of a pioneering computer scientist who shaped the modern internet.',
  'Dr. Amina Osei is a Ghanaian-American professor of computer science at MIT.',
  4.9, 1200, 7, 40, false
),
(
  'The Long Road Home',
  'James Okafor',
  (SELECT id FROM publishers WHERE slug = 'macmillan'),
  (SELECT id FROM categories WHERE slug = 'biography'),
  449.00, 'paperback', 'English',
  '/images/books/the-long-road-home.jpg',
  'A journalist''s decade-long journey through conflict zones and the stories that changed him.',
  'James Okafor is a Pulitzer Prize-nominated war correspondent.',
  4.6, 900, 6, 60, false
),

-- Memoir
(
  'Salt and Sorrow',
  'Yuki Tanaka',
  (SELECT id FROM publishers WHERE slug = 'simon-schuster'),
  (SELECT id FROM categories WHERE slug = 'memoir'),
  349.00, 'hardcover', 'English',
  '/images/books/salt-and-sorrow.jpg',
  'A chef''s deeply personal account of loss, healing, and finding solace through food.',
  'Yuki Tanaka is a Michelin-starred chef and first-time author.',
  4.7, 1700, 5, 95, false
),
(
  'Growing Up Different',
  'Leila Hassan',
  (SELECT id FROM publishers WHERE slug = 'penguin-random-house'),
  (SELECT id FROM categories WHERE slug = 'memoir'),
  299.00, 'ebook', 'English',
  '/images/books/growing-up-different.jpg',
  'A candid memoir about navigating identity, belonging, and finding your voice in a divided world.',
  'Leila Hassan is a spoken word artist and social activist.',
  4.4, 1300, 4, 120, false
),

-- Children's
(
  'The Lost Kitten',
  'Emma Bright',
  (SELECT id FROM publishers WHERE slug = 'harpercollins'),
  (SELECT id FROM categories WHERE slug = 'childrens'),
  149.00, 'paperback', 'English',
  '/images/books/the-lost-kitten.jpg',
  'A heartwarming tale of a little kitten''s adventure finding her way back home.',
  'Emma Bright has written over 30 beloved picture books for young readers.',
  4.8, 5000, 3, 300, true
),
(
  'Captain Stardust and the Moon Pirates',
  'Oliver Green',
  (SELECT id FROM publishers WHERE slug = 'macmillan'),
  (SELECT id FROM categories WHERE slug = 'childrens'),
  179.00, 'hardcover', 'English',
  '/images/books/captain-stardust-and-the-moon-pirates.jpg',
  'A brave young astronaut battles moon pirates to protect the galaxy''s greatest treasure: books.',
  'Oliver Green is a children''s author and former primary school teacher.',
  4.7, 3800, 4, 210, false
),
(
  'Zara and the Magic Garden',
  'Priya Sharma',
  (SELECT id FROM publishers WHERE slug = 'penguin-random-house'),
  (SELECT id FROM categories WHERE slug = 'childrens'),
  129.00, 'ebook', 'English',
  '/images/books/zara-and-the-magic-garden.jpg',
  'Zara discovers a hidden garden where plants can talk — and one of them needs her help.',
  'Priya Sharma is a Mumbai-based children''s author and illustrator.',
  4.6, 2700, 3, 250, false
),

-- Young Adult
(
  'The Last Signal',
  'Nia Blake',
  (SELECT id FROM publishers WHERE slug = 'simon-schuster'),
  (SELECT id FROM categories WHERE slug = 'young-adult'),
  299.00, 'paperback', 'English',
  '/images/books/the-last-signal.jpg',
  'When all communication goes dark, a group of teenagers must cross a post-collapse city to reach safety.',
  'Nia Blake writes YA dystopian and thriller fiction.',
  4.5, 3100, 5, 100, false
),
(
  'Every Shade of Blue',
  'Camille Dubois',
  (SELECT id FROM publishers WHERE slug = 'harpercollins'),
  (SELECT id FROM categories WHERE slug = 'young-adult'),
  249.00, 'ebook', 'English',
  '/images/books/every-shade-of-blue.jpg',
  'A coming-of-age story about grief, first love, and finding colour in a world gone grey.',
  'Camille Dubois is a French-Canadian author shortlisted for the Carnegie Medal.',
  4.6, 2400, 4, 130, false
),

-- Science
(
  'The Quantum Brain',
  'Dr. Samuel Pierce',
  (SELECT id FROM publishers WHERE slug = 'oxford-university-press'),
  (SELECT id FROM categories WHERE slug = 'science'),
  549.00, 'hardcover', 'English',
  '/images/books/the-quantum-brain.jpg',
  'A lucid exploration of how quantum mechanics may underpin consciousness itself.',
  'Dr. Samuel Pierce is a neuroscientist and quantum physicist at Cambridge University.',
  4.7, 800, 7, 45, false
),
(
  'Deep Ocean, Deep Time',
  'Marina Voss',
  (SELECT id FROM publishers WHERE slug = 'macmillan'),
  (SELECT id FROM categories WHERE slug = 'science'),
  399.00, 'paperback', 'English',
  '/images/books/deep-ocean-deep-time.jpg',
  'A marine biologist reveals the astonishing biodiversity hidden in Earth''s deepest trenches.',
  'Marina Voss has led over 40 deep-sea expeditions and holds a record for deepest solo dive.',
  4.8, 1100, 6, 70, false
),

-- Philosophy
(
  'The Examined Life',
  'Prof. Hugo Richter',
  (SELECT id FROM publishers WHERE slug = 'oxford-university-press'),
  (SELECT id FROM categories WHERE slug = 'philosophy'),
  499.00, 'hardcover', 'English',
  '/images/books/the-examined-life.jpg',
  'A modern philosopher revisits the great questions of human existence with wit and rigour.',
  'Prof. Hugo Richter teaches philosophy at the University of Vienna.',
  4.5, 600, 7, 55, false
),
(
  'Ethics in the Age of AI',
  'Dr. Ranya Patel',
  (SELECT id FROM publishers WHERE slug = 'simon-schuster'),
  (SELECT id FROM categories WHERE slug = 'philosophy'),
  349.00, 'ebook', 'English',
  '/images/books/ethics-in-the-age-of-ai.jpg',
  'How should humanity navigate the ethical minefield created by artificial intelligence?',
  'Dr. Ranya Patel is an ethicist and tech policy advisor based in London.',
  4.6, 950, 4, 90, false
),

-- Historical
(
  'The Last Empress',
  'Catherine Bell',
  (SELECT id FROM publishers WHERE slug = 'penguin-random-house'),
  (SELECT id FROM categories WHERE slug = 'historical'),
  499.00, 'hardcover', 'English',
  '/images/books/the-last-empress.jpg',
  'The untold story of the last empress of a crumbling dynasty — and the choices that could save or destroy her people.',
  'Catherine Bell is a historian and novelist specialising in East Asian history.',
  4.8, 2200, 6, 65, true
),
(
  'Sands of Empire',
  'Hassan Karim',
  (SELECT id FROM publishers WHERE slug = 'macmillan'),
  (SELECT id FROM categories WHERE slug = 'historical'),
  449.00, 'paperback', 'English',
  '/images/books/sands-of-empire.jpg',
  'A sweeping saga set across three generations of a trading family at the heart of the Silk Road.',
  'Hassan Karim is a historian and award-winning author of Middle Eastern historical fiction.',
  4.7, 1800, 5, 80, false
),

-- Travel
(
  'Into the Wild North',
  'Lars Bjornsen',
  (SELECT id FROM publishers WHERE slug = 'harpercollins'),
  (SELECT id FROM categories WHERE slug = 'travel'),
  299.00, 'paperback', 'English',
  '/images/books/into-the-wild-north.jpg',
  'An Icelandic adventurer retraces Viking routes across the North Atlantic by kayak.',
  'Lars Bjornsen is a National Geographic explorer and travel memoirist.',
  4.4, 1400, 5, 100, false
),
(
  'City of a Thousand Lanes',
  'Ananya Roy',
  (SELECT id FROM publishers WHERE slug = 'penguin-random-house'),
  (SELECT id FROM categories WHERE slug = 'travel'),
  249.00, 'ebook', 'English',
  '/images/books/city-of-a-thousand-lanes.jpg',
  'A love letter to Mumbai: its street food, monsoons, film sets, and relentless spirit.',
  'Ananya Roy is a travel writer and food journalist based in Mumbai.',
  4.6, 1700, 3, 160, false
),

-- Poetry
(
  'Fragments of Light',
  'Nadia Obi',
  (SELECT id FROM publishers WHERE slug = 'oxford-university-press'),
  (SELECT id FROM categories WHERE slug = 'poetry'),
  199.00, 'paperback', 'English',
  '/images/books/fragments-of-light.jpg',
  'A debut collection exploring diaspora, identity, and the beauty found in ordinary moments.',
  'Nadia Obi is a Nigerian-British poet and creative writing lecturer.',
  4.5, 700, 4, 110, false
),

-- Language Learning
(
  'Speak Japanese in 30 Days',
  'Kenji Nakamura',
  (SELECT id FROM publishers WHERE slug = 'oxford-university-press'),
  (SELECT id FROM categories WHERE slug = 'language-learning'),
  399.00, 'paperback', 'English',
  '/images/books/speak-japanese-in-30-days.jpg',
  'A structured daily programme that takes complete beginners to conversational Japanese in one month.',
  'Kenji Nakamura is a linguist and language school founder based in Tokyo.',
  4.3, 3400, 5, 190, false
),
(
  'The French Companion',
  'Marie Leblanc',
  (SELECT id FROM publishers WHERE slug = 'macmillan'),
  (SELECT id FROM categories WHERE slug = 'language-learning'),
  349.00, 'ebook', 'English',
  '/images/books/the-french-companion.jpg',
  'A comprehensive phrase guide and grammar primer for everyday French, from café to office.',
  'Marie Leblanc is a language coach and cultural liaison at the French Embassy.',
  4.4, 2100, 3, 175, false
),

-- Cooking
(
  'The Spice Atlas',
  'Ravi Sundaram',
  (SELECT id FROM publishers WHERE slug = 'harpercollins'),
  (SELECT id FROM categories WHERE slug = 'cooking'),
  599.00, 'hardcover', 'English',
  '/images/books/the-spice-atlas.jpg',
  'A lavishly illustrated journey through 80 spices — their history, cultivation, and best recipes.',
  'Ravi Sundaram is a food historian and spice merchant turned cookbook author.',
  4.9, 2600, 6, 55, true
),
(
  'Quick Comfort: 100 Weeknight Recipes',
  'Sarah Bloom',
  (SELECT id FROM publishers WHERE slug = 'simon-schuster'),
  (SELECT id FROM categories WHERE slug = 'cooking'),
  299.00, 'paperback', 'English',
  '/images/books/quick-comfort-100-weeknight-recipes.jpg',
  'Nourishing, flavour-packed meals that come together in 30 minutes or less.',
  'Sarah Bloom is a food blogger and former restaurant chef with a following of 2 million.',
  4.6, 4100, 4, 130, false
)
ON CONFLICT (title) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Test user
-- password: Test@1234  |  bcrypt cost 12
-- ---------------------------------------------------------------------------
INSERT INTO users (email, password_hash, full_name, role, gift_points)
VALUES (
  'test@bookworm.com',
  '$2b$12$sR65Wwu0v6nFFdltpnFBWu.U28iyBq3/Dix7M8efbfkvxpxgmy9W.',
  'Test User',
  'customer',
  150
)
ON CONFLICT (email) DO NOTHING;
