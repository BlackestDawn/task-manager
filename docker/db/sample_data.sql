-- Sample Data Script for Task Manager
-- This script populates the database with sample data for testing and development
-- Default password for all users: "password123"

BEGIN;

-- Insert sample users
-- Password: password123
INSERT INTO users (login, name, password, email, access_level) VALUES
    ('mark_smith', 'Mark Smith', '$2b$10$rWN5zF3qY7L0hV3gZX5xWOX8XQKqJ5YvH.X9vKlY5KqZ5L0h3gZXY', 'mark@example.com', 'manager'),
    ('john_doe', 'John Doe', '$2b$10$rWN5zF3qY7L0hV3gZX5xWOX8XQKqJ5YvH.X9vKlY5KqZ5L0h3gZXY', 'john@example.com', 'user'),
    ('jane_smith', 'Jane Smith', '$2b$10$rWN5zF3qY7L0hV3gZX5xWOX8XQKqJ5YvH.X9vKlY5KqZ5L0h3gZXY', 'jane@example.com', 'user'),
    ('bob_wilson', 'Bob Wilson', '$2b$10$rWN5zF3qY7L0hV3gZX5xWOX8XQKqJ5YvH.X9vKlY5KqZ5L0h3gZXY', 'bob@example.com', 'user'),
    ('alice_jones', 'Alice Jones', '$2b$10$rWN5zF3qY7L0hV3gZX5xWOX8XQKqJ5YvH.X9vKlY5KqZ5L0h3gZXY', 'alice@example.com', 'user');

-- Insert sample groups
INSERT INTO groups (name, description) VALUES
    ('Development Team', 'Software development and engineering tasks'),
    ('Marketing Team', 'Marketing campaigns and content creation'),
    ('Product Team', 'Product management and roadmap planning');

-- Insert group memberships
INSERT INTO user_groups (user_id, group_id, role) VALUES
    -- Mark is supervisor of all groups
    ((SELECT id FROM users WHERE login = 'mark_smith'), (SELECT id FROM groups WHERE name = 'Development Team'), 'supervisor'),
    ((SELECT id FROM users WHERE login = 'mark_smith'), (SELECT id FROM groups WHERE name = 'Marketing Team'), 'supervisor'),
    ((SELECT id FROM users WHERE login = 'mark_smith'), (SELECT id FROM groups WHERE name = 'Product Team'), 'supervisor'),
    -- John is in Development Team
    ((SELECT id FROM users WHERE login = 'john_doe'), (SELECT id FROM groups WHERE name = 'Development Team'), 'editor'),
    -- Jane is in Marketing Team
    ((SELECT id FROM users WHERE login = 'jane_smith'), (SELECT id FROM groups WHERE name = 'Marketing Team'), 'user'),
    -- Bob is in Development and Product Teams
    ((SELECT id FROM users WHERE login = 'bob_wilson'), (SELECT id FROM groups WHERE name = 'Development Team'), 'user'),
    ((SELECT id FROM users WHERE login = 'bob_wilson'), (SELECT id FROM groups WHERE name = 'Product Team'), 'editor'),
    -- Alice is in Marketing and Product Teams
    ((SELECT id FROM users WHERE login = 'alice_jones'), (SELECT id FROM groups WHERE name = 'Marketing Team'), 'user'),
    ((SELECT id FROM users WHERE login = 'alice_jones'), (SELECT id FROM groups WHERE name = 'Product Team'), 'user');

-- Insert sample tasks
INSERT INTO tasks (user_id, title, description, finish_by, completed) VALUES
    -- Mark's tasks (Management tasks in Development Team)
    ((SELECT id FROM users WHERE login = 'mark_smith'), 'Review security audit', 'Complete security audit review and implement recommendations', NOW() + INTERVAL '7 days', false),
    ((SELECT id FROM users WHERE login = 'mark_smith'), 'Setup CI/CD pipeline', 'Configure automated deployment pipeline', NOW() + INTERVAL '3 days', false),

    -- John's tasks (Developer in Development Team)
    ((SELECT id FROM users WHERE login = 'john_doe'), 'Implement user authentication', 'Add JWT-based authentication to the API', NOW() + INTERVAL '5 days', false),
    ((SELECT id FROM users WHERE login = 'john_doe'), 'Fix database migration bug', 'Resolve issues with Drizzle migrations', NOW() + INTERVAL '2 days', false),
    ((SELECT id FROM users WHERE login = 'john_doe'), 'Write unit tests', 'Add test coverage for auth module', NOW() + INTERVAL '4 days', false),
    ((SELECT id FROM users WHERE login = 'john_doe'), 'Code review PR #123', 'Review and approve pull request', NOW() - INTERVAL '1 day', true),

    -- Jane's tasks (Marketing Team)
    ((SELECT id FROM users WHERE login = 'jane_smith'), 'Create social media content', 'Prepare content calendar for next month', NOW() + INTERVAL '10 days', false),
    ((SELECT id FROM users WHERE login = 'jane_smith'), 'Analyze campaign metrics', 'Review Q1 marketing campaign performance', NOW() + INTERVAL '3 days', false),
    ((SELECT id FROM users WHERE login = 'jane_smith'), 'Update website copy', 'Refresh homepage and product pages', NOW() - INTERVAL '2 days', true),

    -- Bob's tasks (Development and Product Teams)
    ((SELECT id FROM users WHERE login = 'bob_wilson'), 'Design new feature UI', 'Create mockups for task filtering feature', NOW() + INTERVAL '6 days', false),
    ((SELECT id FROM users WHERE login = 'bob_wilson'), 'Research competitor features', 'Analyze competitor task management tools', NOW() + INTERVAL '8 days', false),
    ((SELECT id FROM users WHERE login = 'bob_wilson'), 'Optimize database queries', 'Improve query performance for large datasets', NOW() - INTERVAL '3 days', true),

    -- Alice's tasks (Marketing and Product Teams)
    ((SELECT id FROM users WHERE login = 'alice_jones'), 'Customer feedback analysis', 'Compile and analyze user feedback from surveys', NOW() + INTERVAL '5 days', false),
    ((SELECT id FROM users WHERE login = 'alice_jones'), 'Product roadmap planning', 'Draft Q2 product roadmap with team input', NOW() + INTERVAL '14 days', false),
    ((SELECT id FROM users WHERE login = 'alice_jones'), 'Email campaign setup', 'Configure automated email workflows', NOW() - INTERVAL '5 days', true);

-- Update completed_at for completed tasks
UPDATE tasks SET completed_at = updated_at WHERE completed = true;

-- Make tasks avaiable to whole group
INSERT INTO task_groups (group_id, task_id, assigned_by) VALUES
    -- Development tasks
    ((SELECT id FROM groups WHERE name = 'Development Team'), (SELECT id FROM tasks WHERE title = 'Review security audit') ,(SELECT id FROM users WHERE login = 'mark_smith')),
    ((SELECT id FROM groups WHERE name = 'Development Team'), (SELECT id FROM tasks WHERE title = 'Setup CI/CD pipeline') ,(SELECT id FROM users WHERE login = 'mark_smith')),
    ((SELECT id FROM groups WHERE name = 'Development Team'), (SELECT id FROM tasks WHERE title = 'Implement user authentication') ,(SELECT id FROM users WHERE login = 'mark_smith')),
    ((SELECT id FROM groups WHERE name = 'Development Team'), (SELECT id FROM tasks WHERE title = 'Fix database migration bug') ,(SELECT id FROM users WHERE login = 'mark_smith')),
    ((SELECT id FROM groups WHERE name = 'Development Team'), (SELECT id FROM tasks WHERE title = 'Write unit tests') ,(SELECT id FROM users WHERE login = 'mark_smith')),
    ((SELECT id FROM groups WHERE name = 'Development Team'), (SELECT id FROM tasks WHERE title = 'Code review PR #123') ,(SELECT id FROM users WHERE login = 'mark_smith')),
    ((SELECT id FROM groups WHERE name = 'Development Team'), (SELECT id FROM tasks WHERE title = 'Optimize database queries') ,(SELECT id FROM users WHERE login = 'mark_smith')),

    -- Marketing tasks
    ((SELECT id FROM groups WHERE name = 'Marketing Team'), (SELECT id FROM tasks WHERE title = 'Create social media content') ,(SELECT id FROM users WHERE login = 'mark_smith')),
    ((SELECT id FROM groups WHERE name = 'Marketing Team'), (SELECT id FROM tasks WHERE title = 'Analyze campaign metrics') ,(SELECT id FROM users WHERE login = 'mark_smith')),
    ((SELECT id FROM groups WHERE name = 'Marketing Team'), (SELECT id FROM tasks WHERE title = 'Update website copy') ,(SELECT id FROM users WHERE login = 'mark_smith')),
    ((SELECT id FROM groups WHERE name = 'Marketing Team'), (SELECT id FROM tasks WHERE title = 'Email campaign setup') ,(SELECT id FROM users WHERE login = 'mark_smith')),

    -- Product tasks
    ((SELECT id FROM groups WHERE name = 'Product Team'), (SELECT id FROM tasks WHERE title = 'Design new feature UI') ,(SELECT id FROM users WHERE login = 'mark_smith')),
    ((SELECT id FROM groups WHERE name = 'Product Team'), (SELECT id FROM tasks WHERE title = 'Research competitor features') ,(SELECT id FROM users WHERE login = 'mark_smith')),
    ((SELECT id FROM groups WHERE name = 'Product Team'), (SELECT id FROM tasks WHERE title = 'Customer feedback analysis') ,(SELECT id FROM users WHERE login = 'mark_smith')),
    ((SELECT id FROM groups WHERE name = 'Product Team'), (SELECT id FROM tasks WHERE title = 'Product roadmap planning') ,(SELECT id FROM users WHERE login = 'mark_smith'));

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Sample data loaded successfully!';
    RAISE NOTICE '5 users, 3 groups, and 15 tasks have been created.';
    RAISE NOTICE 'Default password for all users: password123';
END $$;

COMMIT;