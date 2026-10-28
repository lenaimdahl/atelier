-- Picks are counted per book instead of stored per visitor, so the table never
-- grows beyond the books in the library.
CREATE TABLE IF NOT EXISTS catalog_books (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    language TEXT NOT NULL CHECK (language IN ('en', 'de')),
    cover_url TEXT,
    favorite_count INTEGER NOT NULL DEFAULT 0,
    last_favorited_at TIMESTAMPTZ,
    imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
