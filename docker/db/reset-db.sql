DELETE FROM users;

DELETE FROM groups;

DELETE FROM refresh_tokens;

INSERT INTO users (login, name, password, access_level)
VALUES ('admin', 'Administrator', '$2b$10$NH1Iuy.ABCvVI6.4rO406O2/.YIvCyF9JFXJMEJU6rHC7AHkFdgmy', 'admin');
