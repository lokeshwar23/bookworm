-- BookWorm Database Schema
-- Run via: node lib/migrate.js

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- ENUM types
-- ---------------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE book_format AS ENUM ('paperback', 'hardcover', 'ebook');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- 1. users
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name     VARCHAR(255) NOT NULL,
  role          VARCHAR(20)  NOT NULL DEFAULT 'customer',
  gift_points   INT          NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 2. categories
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL
);

-- ---------------------------------------------------------------------------
-- 3. publishers
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS publishers (
  id   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL
);

-- ---------------------------------------------------------------------------
-- 4. books
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS books (
  id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  title            VARCHAR(500)  NOT NULL UNIQUE,
  author           VARCHAR(255)  NOT NULL,
  publisher_id     UUID          REFERENCES publishers(id),
  category_id      UUID          REFERENCES categories(id),
  price            NUMERIC(10,2) NOT NULL,
  format           book_format   NOT NULL DEFAULT 'paperback',
  language         VARCHAR(50)   NOT NULL DEFAULT 'English',
  cover_image_url  TEXT,
  description      TEXT,
  author_bio       TEXT,
  rating           NUMERIC(3,2)  NOT NULL DEFAULT 0,
  sales_count      INT           NOT NULL DEFAULT 0,
  delivery_days    INT           NOT NULL DEFAULT 5,
  stock            INT           NOT NULL DEFAULT 100,
  is_featured      BOOLEAN       NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 5. addresses
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS addresses (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  first_name   VARCHAR(100),
  last_name    VARCHAR(100),
  address_line TEXT,
  city         VARCHAR(100),
  state        VARCHAR(100),
  pin          VARCHAR(10),
  phone        VARCHAR(15),
  is_default   BOOLEAN     NOT NULL DEFAULT false
);

-- ---------------------------------------------------------------------------
-- 6. cart_items
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cart_items (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(100),
  user_id    UUID        REFERENCES users(id) ON DELETE CASCADE,
  book_id    UUID        NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  quantity   INT         NOT NULL DEFAULT 1,
  added_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (session_id, book_id),
  UNIQUE (user_id, book_id)
);

-- ---------------------------------------------------------------------------
-- 7. wishlists
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS wishlists (
  id       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id  UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id  UUID        NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, book_id)
);

-- ---------------------------------------------------------------------------
-- 8. followed_authors
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS followed_authors (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  author_name VARCHAR(255) NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, author_name)
);

-- ---------------------------------------------------------------------------
-- 9. orders
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID          REFERENCES users(id),
  guest_email         VARCHAR(255),
  status              order_status  NOT NULL DEFAULT 'pending',
  subtotal            NUMERIC(10,2),
  tax                 NUMERIC(10,2),
  delivery_charge     NUMERIC(10,2),
  discount            NUMERIC(10,2) NOT NULL DEFAULT 0,
  total               NUMERIC(10,2),
  payment_method      VARCHAR(50),
  gift_points_used    INT           NOT NULL DEFAULT 0,
  razorpay_order_id   VARCHAR(255),
  razorpay_payment_id VARCHAR(255),
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 9. order_items
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
  id         UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   UUID          NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  book_id    UUID          REFERENCES books(id),
  quantity   INT           NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL
);

-- ---------------------------------------------------------------------------
-- 10. gift_point_transactions
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gift_point_transactions (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id   UUID        REFERENCES orders(id),
  delta      INT         NOT NULL,
  reason     VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_books_category    ON books(category_id);
CREATE INDEX IF NOT EXISTS idx_books_publisher   ON books(publisher_id);
CREATE INDEX IF NOT EXISTS idx_cart_session      ON cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_orders_user       ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_books_featured    ON books(is_featured);
CREATE INDEX IF NOT EXISTS idx_books_sales       ON books(sales_count DESC);
CREATE INDEX IF NOT EXISTS idx_followed_authors  ON followed_authors(user_id);
