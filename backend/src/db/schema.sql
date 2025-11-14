-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  avatar TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create app_role enum
CREATE TYPE app_role AS ENUM ('owner', 'admin', 'member', 'viewer');

-- User roles table (for security)
CREATE TABLE IF NOT EXISTS user_roles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  board_id INTEGER,
  role app_role NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, board_id)
);

-- Boards table
CREATE TABLE IF NOT EXISTS boards (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  color VARCHAR(50) DEFAULT 'blue',
  owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Lists table
CREATE TABLE IF NOT EXISTS lists (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  position INTEGER NOT NULL,
  board_id INTEGER REFERENCES boards(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Cards table
CREATE TABLE IF NOT EXISTS cards (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  position INTEGER NOT NULL,
  color VARCHAR(50),
  list_id INTEGER REFERENCES lists(id) ON DELETE CASCADE,
  due_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  card_id INTEGER REFERENCES cards(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Attachments table
CREATE TABLE IF NOT EXISTS attachments (
  id SERIAL PRIMARY KEY,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(100),
  card_id INTEGER REFERENCES cards(id) ON DELETE CASCADE,
  uploaded_by INTEGER REFERENCES users(id),
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Board members table
CREATE TABLE IF NOT EXISTS board_members (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  board_id INTEGER REFERENCES boards(id) ON DELETE CASCADE,
  role app_role DEFAULT 'member',
  added_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, board_id)
);

-- Activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Session table (for express-session)
CREATE TABLE IF NOT EXISTS "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL,
  CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_boards_owner ON boards(owner_id);
CREATE INDEX IF NOT EXISTS idx_lists_board ON lists(board_id);
CREATE INDEX IF NOT EXISTS idx_cards_list ON cards(list_id);
CREATE INDEX IF NOT EXISTS idx_comments_card ON comments(card_id);
CREATE INDEX IF NOT EXISTS idx_attachments_card ON attachments(card_id);
CREATE INDEX IF NOT EXISTS idx_board_members_board ON board_members(board_id);
CREATE INDEX IF NOT EXISTS idx_board_members_user ON board_members(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");

-- Function to check user role
CREATE OR REPLACE FUNCTION has_board_access(
  _user_id INTEGER,
  _board_id INTEGER,
  _required_role app_role
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM board_members
    WHERE user_id = _user_id
      AND board_id = _board_id
      AND role = _required_role
  ) OR EXISTS (
    SELECT 1
    FROM boards
    WHERE id = _board_id
      AND owner_id = _user_id
  );
END;
$$;