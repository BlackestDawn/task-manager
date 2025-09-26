DELETE FROM users;

DELETE FROM groups;

DELETE FROM refresh_tokens;

INSERT INTO users (login, name, password, access_level)
VALUES ('admin', 'Administrator', '$2b$10$rd..08azGOvnYFpAR/Gb..ljhTyaPLRRG48tCIByDIfXQL8POHvF.', 'admin');
