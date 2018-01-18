\c maphubs
set role maphubs;

INSERT INTO users (display_name, email, email_valid, pass_crypt, creation_time) VALUES ('maphubs', 'kris@maphubs.com', TRUE, 'NOT_USED', now());