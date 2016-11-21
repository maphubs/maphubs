
exports.up = function(knex, Promise) {

    return Promise.all([
        knex.raw(`CREATE INDEX layers_text_search_fr_idx ON omh.layers USING GIN (to_tsvector('french', name || ' ' || COALESCE(description, '') || ' ' || COALESCE(source, '')));`),
        knex.raw(`CREATE INDEX groups_text_search_fr_idx ON omh.groups USING GIN (to_tsvector('french', group_id || ' ' || name || ' ' || COALESCE(location, '') || ' ' || COALESCE(description, '')));`),
        knex.raw(`CREATE INDEX hubs_text_search_fr_idx ON omh.hubs USING GIN (to_tsvector('french', hub_id || ' ' || name || ' ' || COALESCE(description, '') || ' ' || COALESCE(tagline, '')));`),
        knex.raw(`CREATE INDEX maps_text_search_fr_idx ON omh.maps USING GIN (to_tsvector('french', title));`),
        knex.raw(`CREATE INDEX layers_text_search_es_idx ON omh.layers USING GIN (to_tsvector('spanish', name || ' ' || COALESCE(description, '') || ' ' || COALESCE(source, '')));`),
        knex.raw(`CREATE INDEX groups_text_search_es_idx ON omh.groups USING GIN (to_tsvector('spanish', group_id || ' ' || name || ' ' || COALESCE(location, '') || ' ' || COALESCE(description, '')));`),
        knex.raw(`CREATE INDEX hubs_text_search_es_idx ON omh.hubs USING GIN (to_tsvector('spanish', hub_id || ' ' || name || ' ' || COALESCE(description, '') || ' ' || COALESCE(tagline, '')));`),
        knex.raw(`CREATE INDEX maps_text_search_es_idx ON omh.maps USING GIN (to_tsvector('spanish', title));`),
        knex.raw(`CREATE INDEX layers_text_search_it_idx ON omh.layers USING GIN (to_tsvector('italian', name || ' ' || COALESCE(description, '') || ' ' || COALESCE(source, '')));`),
        knex.raw(`CREATE INDEX groups_text_search_it_idx ON omh.groups USING GIN (to_tsvector('italian', group_id || ' ' || name || ' ' || COALESCE(location, '') || ' ' || COALESCE(description, '')));`),
        knex.raw(`CREATE INDEX hubs_text_search_it_idx ON omh.hubs USING GIN (to_tsvector('italian', hub_id || ' ' || name || ' ' || COALESCE(description, '') || ' ' || COALESCE(tagline, '')));`),
        knex.raw(`CREATE INDEX maps_text_search_it_idx ON omh.maps USING GIN (to_tsvector('italian', title));`)
        
    ]);

};

exports.down = function(knex, Promise) {

};
