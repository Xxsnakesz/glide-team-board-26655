-- Sample users
INSERT INTO users (name, email, avatar, google_id) VALUES
('John Doe', 'john@example.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=John', 'google_123'),
('Jane Smith', 'jane@example.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane', 'google_456')
ON CONFLICT (email) DO NOTHING;

-- Sample boards
INSERT INTO boards (title, owner_id, color) VALUES
('Product Launch', 1, 'blue'),
('Marketing Campaign', 1, 'green'),
('Development Roadmap', 1, 'purple')
ON CONFLICT DO NOTHING;

-- Sample lists for board 1
INSERT INTO lists (title, position, board_id) VALUES
('To Do', 0, 1),
('In Progress', 1, 1),
('Done', 2, 1)
ON CONFLICT DO NOTHING;

-- Sample cards
INSERT INTO cards (title, description, position, list_id, color) VALUES
('Design landing page', 'Create a modern, responsive landing page', 0, 1, 'blue'),
('Set up analytics', 'Configure Google Analytics and tracking', 1, 1, 'green'),
('Implement authentication', 'Add Google OAuth integration', 0, 2, 'yellow'),
('Project setup', 'Initialize project with React and TypeScript', 0, 3, 'purple')
ON CONFLICT DO NOTHING;
