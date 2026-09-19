-- BookWorm: patch cover_image_url for all existing books
-- Run once in psql: \i db/update-covers.sql
-- or via: node -e "import('./lib/db.js').then(m => m.default.file('db/update-covers.sql'))"

UPDATE books SET cover_image_url = '/images/books/the-art-of-focus.jpg'               WHERE title = 'The Art of Focus';
UPDATE books SET cover_image_url = '/images/books/the-art-of-learning.jpg'             WHERE title = 'The Art of Learning';
UPDATE books SET cover_image_url = '/images/books/the-path-to-success.jpg'             WHERE title = 'The Path to Success';
UPDATE books SET cover_image_url = '/images/books/joy-of-minimalism.jpg'               WHERE title = 'Joy of Minimalism';
UPDATE books SET cover_image_url = '/images/books/the-midnight-hour.jpg'               WHERE title = 'The Midnight Hour';
UPDATE books SET cover_image_url = '/images/books/the-vanishing-house.jpg'             WHERE title = 'The Vanishing House';
UPDATE books SET cover_image_url = '/images/books/shadows-over-baker-street.jpg'       WHERE title = 'Shadows Over Baker Street';
UPDATE books SET cover_image_url = '/images/books/the-final-frontier.jpg'              WHERE title = 'The Final Frontier';
UPDATE books SET cover_image_url = '/images/books/neon-horizon.jpg'                    WHERE title = 'Neon Horizon';
UPDATE books SET cover_image_url = '/images/books/parallel-lives.jpg'                  WHERE title = 'Parallel Lives';
UPDATE books SET cover_image_url = '/images/books/beneath-the-stars.jpg'               WHERE title = 'Beneath the Stars';
UPDATE books SET cover_image_url = '/images/books/the-iron-crown.jpg'                  WHERE title = 'The Iron Crown';
UPDATE books SET cover_image_url = '/images/books/whispers-of-the-ancients.jpg'        WHERE title = 'Whispers of the Ancients';
UPDATE books SET cover_image_url = '/images/books/midnight-in-montmartre.jpg'          WHERE title = 'Midnight in Montmartre';
UPDATE books SET cover_image_url = '/images/books/letters-never-sent.jpg'              WHERE title = 'Letters Never Sent';
UPDATE books SET cover_image_url = '/images/books/a-life-in-code.jpg'                  WHERE title = 'A Life in Code';
UPDATE books SET cover_image_url = '/images/books/the-long-road-home.jpg'              WHERE title = 'The Long Road Home';
UPDATE books SET cover_image_url = '/images/books/salt-and-sorrow.jpg'                 WHERE title = 'Salt and Sorrow';
UPDATE books SET cover_image_url = '/images/books/growing-up-different.jpg'            WHERE title = 'Growing Up Different';
UPDATE books SET cover_image_url = '/images/books/the-lost-kitten.jpg'                 WHERE title = 'The Lost Kitten';
UPDATE books SET cover_image_url = '/images/books/captain-stardust-and-the-moon-pirates.jpg' WHERE title = 'Captain Stardust and the Moon Pirates';
UPDATE books SET cover_image_url = '/images/books/zara-and-the-magic-garden.jpg'       WHERE title = 'Zara and the Magic Garden';
UPDATE books SET cover_image_url = '/images/books/the-last-signal.jpg'                 WHERE title = 'The Last Signal';
UPDATE books SET cover_image_url = '/images/books/every-shade-of-blue.jpg'             WHERE title = 'Every Shade of Blue';
UPDATE books SET cover_image_url = '/images/books/the-quantum-brain.jpg'               WHERE title = 'The Quantum Brain';
UPDATE books SET cover_image_url = '/images/books/deep-ocean-deep-time.jpg'            WHERE title = 'Deep Ocean, Deep Time';
UPDATE books SET cover_image_url = '/images/books/the-examined-life.jpg'               WHERE title = 'The Examined Life';
UPDATE books SET cover_image_url = '/images/books/ethics-in-the-age-of-ai.jpg'         WHERE title = 'Ethics in the Age of AI';
UPDATE books SET cover_image_url = '/images/books/the-last-empress.jpg'                WHERE title = 'The Last Empress';
UPDATE books SET cover_image_url = '/images/books/sands-of-empire.jpg'                 WHERE title = 'Sands of Empire';
UPDATE books SET cover_image_url = '/images/books/into-the-wild-north.jpg'             WHERE title = 'Into the Wild North';
UPDATE books SET cover_image_url = '/images/books/city-of-a-thousand-lanes.jpg'        WHERE title = 'City of a Thousand Lanes';
UPDATE books SET cover_image_url = '/images/books/fragments-of-light.jpg'              WHERE title = 'Fragments of Light';
UPDATE books SET cover_image_url = '/images/books/speak-japanese-in-30-days.jpg'       WHERE title = 'Speak Japanese in 30 Days';
UPDATE books SET cover_image_url = '/images/books/the-french-companion.jpg'            WHERE title = 'The French Companion';
UPDATE books SET cover_image_url = '/images/books/the-spice-atlas.jpg'                 WHERE title = 'The Spice Atlas';
UPDATE books SET cover_image_url = '/images/books/quick-comfort-100-weeknight-recipes.jpg' WHERE title = 'Quick Comfort: 100 Weeknight Recipes';
