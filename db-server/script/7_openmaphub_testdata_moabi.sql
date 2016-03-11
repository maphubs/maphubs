\c maphubs
set role maphubs;

--Groups
INSERT INTO omh.groups (group_id, name, description, location, image_url, published)
VALUES ('MoabiDRC',
    'Moabi DRC',
    'We build technology and partnerships to collaboratively monitor the world’s natural resources',
    'DRC',
	'http://openmaindombe.org/img/logo.png',
	TRUE
	);

--NOTE: we will change these passwords manually after initial setup
INSERT INTO users (display_name, email, email_valid, pass_crypt, creation_time) VALUES ('maphubs', 'kris@maphubs.com', TRUE, '$2a$10$P1NMO8jMPQ0gVdKr0JuE0u8WZi4UcxF0qVuDyrh60c6I5cUZqik0a', now());
INSERT INTO users (display_name, email, email_valid, pass_crypt, creation_time) VALUES ('moabi', 'kris@moabi.org', TRUE, '$2a$10$P1NMO8jMPQ0gVdKr0JuE0u8WZi4UcxF0qVuDyrh60c6I5cUZqik0a', now());

INSERT INTO omh.group_memberships (group_id, user_id, role)
VALUES ('MoabiDRC', (SELECT id from users where display_name = 'moabi'), 'Administrator');
INSERT INTO omh.group_memberships (group_id, user_id, role)
VALUES ('MoabiDRC', (SELECT id from users where display_name = 'maphubs'), 'Administrator');


-------
--Hubs
-------
INSERT INTO omh.hubs (hub_id, name, description, published)
VALUES ('moabidrc', 'Moabi DRC', 'We build technology and partnerships to collaboratively monitor the world’s natural resources', true);

INSERT INTO omh.hub_memberships (hub_id, user_id, role)
VALUES ('moabidrc', (SELECT id from users where display_name = 'moabi'), 'Administrator');




INSERT INTO omh.stories(title, body, language, user_id, published, created_at, updated_at)
VALUES ('Test Story 1','This is a test','en-us',1,TRUE, now(), now());

INSERT INTO omh.hub_stories (hub_id, story_id)
VALUES ('moabidrc', 1);

INSERT INTO omh.stories(title, body, language, user_id, published, created_at, updated_at)
VALUES ('Test Story 2','This is a test','en-us',1,TRUE, now(), now());

INSERT INTO omh.hub_stories (hub_id, story_id)
VALUES ('moabidrc', 2);

INSERT INTO omh.stories(title, body, language, user_id, published, created_at, updated_at)
VALUES ('Test Story 3','This is a test','en-us',1,TRUE, now(), now());

INSERT INTO omh.hub_stories (hub_id, story_id)
VALUES ('moabidrc', 3);
