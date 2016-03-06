\c maphubs
set role maphubs;
--increase the size of the access token secret
ALTER TABLE oauth_tokens ALTER COLUMN secret TYPE varchar(255);


--add layer_ids to nodes, ways, and relations
ALTER TABLE current_nodes ADD COLUMN layer_id int;
ALTER TABLE current_ways ADD COLUMN layer_id int;
ALTER TABLE current_relations ADD COLUMN layer_id int;

CREATE INDEX current_nodes_layer_id_idx ON current_nodes (layer_id);
CREATE INDEX current_ways_layer_id_idx ON current_ways (layer_id);
CREATE INDEX current_relations_layer_id_idx ON current_relations (layer_id);


--User
ALTER TABLE users ADD COLUMN pass_reset varchar(255);
ALTER TABLE users DROP COLUMN pass_salt;


--jump the sequences ahead to avoid conflicts with osmosis imports
--select setval('changesets_id_seq',(select max(id)+1 from changesets));
--select setval('current_nodes_id_seq',(select max(id)+1 from current_nodes));
--select setval('current_ways_id_seq',(select max(id)+1 from current_ways));
--select setval('current_relations_id_seq',(select max(id)+1 from current_relations));
