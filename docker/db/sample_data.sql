-- Sample Data Script for Task Manager
-- This script populates the database with sample data for testing and development
-- Default password for all users: "password123"

BEGIN;

-- Insert sample users
-- Password: password123
INSERT INTO users (id, login, name, password, email, access_level) VALUES
    ('00000000-0000-0000-0000-000000000001', 'admin', 'Admin User', '$2b$10$rWN5zF3qY7L0hV3gZX5xWOX8XQKqJ5YvH.X9vKlY5KqZ5L0h3gZXY', 'admin@taskmanager.com', 'admin'),
    ('00000000-0000-0000-0000-000000000002', 'john_doe', 'John Doe', '$2b$10$rWN5zF3qY7L0hV3gZX5xWOX8XQKqJ5YvH.X9vKlY5KqZ5L0h3gZXY', 'john@example.com', 'user'),
    ('00000000-0000-0000-0000-000000000003', 'jane_smith', 'Jane Smith', '$2b$10$rWN5zF3qY7L0hV3gZX5xWOX8XQKqJ5YvH.X9vKlY5KqZ5L0h3gZXY', 'jane@example.com', 'user'),
    ('00000000-0000-0000-0000-000000000004', 'bob_wilson', 'Bob Wilson', '$2b$10$rWN5zF3qY7L0hV3gZX5xWOX8XQKqJ5YvH.X9vKlY5KqZ5L0h3gZXY', 'bob@example.com', 'user'),
    ('00000000-0000-0000-0000-000000000005', 'alice_jones', 'Alice Jones', '$2b$10$rWN5zF3qY7L0hV3gZX5xWOX8XQKqJ5YvH.X9vKlY5KqZ5L0h3gZXY', 'alice@example.com', 'user');

-- Insert sample groups
INSERT INTO groups (id, name, description) VALUES
    ('10000000-0000-0000-0000-000000000001', 'Development Team', 'Software development and engineering tasks'),
    ('10000000-0000-0000-0000-000000000002', 'Marketing Team', 'Marketing campaigns and content creation'),
    ('10000000-0000-0000-0000-000000000003', 'Product Team', 'Product management and roadmap planning');

-- Insert group memberships
INSERT INTO group_members (user_id, group_id, role) VALUES
    -- Admin is admin of all groups
    ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'admin'),
    ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'admin'),
    ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'admin'),
    -- John is in Development Team
    ('00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'admin'),
    -- Jane is in Marketing Team
    ('00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'user'),
    -- Bob is in Development and Product Teams
    ('00000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'user'),
    ('00000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000003', 'admin'),
    -- Alice is in Marketing and Product Teams
    ('00000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', 'user'),
    ('00000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000003', 'user');

-- Insert sample tasks
INSERT INTO tasks (user_id, title, description, finish_by, completed) VALUES
    -- Admin tasks
    ('00000000-0000-0000-0000-000000000001', 'Review security audit', 'Complete security audit review and implement recommendations', NOW() + INTERVAL '7 days', false),
    ('00000000-0000-0000-0000-000000000001', 'Setup CI/CD pipeline', 'Configure automated deployment pipeline', NOW() + INTERVAL '3 days', false),

    -- John's tasks (Developer)
    ('00000000-0000-0000-0000-000000000002', 'Implement user authentication', 'Add JWT-based authentication to the API', NOW() + INTERVAL '5 days', false),
    ('00000000-0000-0000-0000-000000000002', 'Fix database migration bug', 'Resolve issues with Drizzle migrations', NOW() + INTERVAL '2 days', false),
    ('00000000-0000-0000-0000-000000000002', 'Write unit tests', 'Add test coverage for auth module', NOW() + INTERVAL '4 days', false),
    ('00000000-0000-0000-0000-000000000002', 'Code review PR #123', 'Review and approve pull request', NOW() - INTERVAL '1 day', true),

    -- Jane's tasks (Marketing)
    ('00000000-0000-0000-0000-000000000003', 'Create social media content', 'Prepare content calendar for next month', NOW() + INTERVAL '10 days', false),
    ('00000000-0000-0000-0000-000000000003', 'Analyze campaign metrics', 'Review Q1 marketing campaign performance', NOW() + INTERVAL '3 days', false),
    ('00000000-0000-0000-0000-000000000003', 'Update website copy', 'Refresh homepage and product pages', NOW() - INTERVAL '2 days', true),

    -- Bob's tasks (Developer/Product)
    ('00000000-0000-0000-0000-000000000004', 'Design new feature UI', 'Create mockups for task filtering feature', NOW() + INTERVAL '6 days', false),
    ('00000000-0000-0000-0000-000000000004', 'Research competitor features', 'Analyze competitor task management tools', NOW() + INTERVAL '8 days', false),
    ('00000000-0000-0000-0000-000000000004', 'Optimize database queries', 'Improve query performance for large datasets', NOW() - INTERVAL '3 days', true),

    -- Alice's tasks (Marketing/Product)
    ('00000000-0000-0000-0000-000000000005', 'Customer feedback analysis', 'Compile and analyze user feedback from surveys', NOW() + INTERVAL '5 days', false),
    ('00000000-0000-0000-0000-000000000005', 'Product roadmap planning', 'Draft Q2 product roadmap with team input', NOW() + INTERVAL '14 days', false),
    ('00000000-0000-0000-0000-000000000005', 'Email campaign setup', 'Configure automated email workflows', NOW() - INTERVAL '5 days', true);

-- Update completed_at for completed tasks
UPDATE tasks SET completed_at = updated_at WHERE completed = true;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Sample data loaded successfully!';
    RAISE NOTICE '5 users, 3 groups, and 15 tasks have been created.';
    RAISE NOTICE 'Default password for all users: password123';
END $$;

COMMIT;