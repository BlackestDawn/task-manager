DELETE FROM users;

DELETE FROM groups;

DELETE FROM refresh_tokens;

INSERT INTO users (login, name, password)
VALUES ('admin', 'Administrator', '$2b$10$rd..08azGOvnYFpAR/Gb..ljhTyaPLRRG48tCIByDIfXQL8POHvF.');

INSERT INTO groups (name)
VALUES ('Administrators');

INSERT INTO user_groups (user_id, group_id, role)
VALUES (
  (SELECT id FROM users WHERE login = 'admin'),
  (SELECT id FROM groups WHERE name = 'Administrators'),
  'admin'
);
