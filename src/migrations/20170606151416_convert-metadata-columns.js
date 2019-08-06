
exports.up = function (knex) {
  return Promise.all([

    // drop indexes
    knex.raw(`DROP INDEX omh.layers_text_search_idx;`),
    knex.raw(`DROP INDEX omh.layers_text_search_fr_idx;`),
    knex.raw(`DROP INDEX omh.layers_text_search_es_idx;`),
    knex.raw(`DROP INDEX omh.layers_text_search_it_idx;`),

    knex.raw(`DROP INDEX omh.groups_text_search_idx;`),
    knex.raw(`DROP INDEX omh.groups_text_search_fr_idx;`),
    knex.raw(`DROP INDEX omh.groups_text_search_es_idx;`),
    knex.raw(`DROP INDEX omh.groups_text_search_it_idx;`),

    knex.raw(`DROP INDEX omh.maps_text_search_idx;`),
    knex.raw(`DROP INDEX omh.maps_text_search_fr_idx;`),
    knex.raw(`DROP INDEX omh.maps_text_search_es_idx;`),
    knex.raw(`DROP INDEX omh.maps_text_search_it_idx;`),

    knex.raw(`alter table omh.layers alter column name type jsonb USING jsonb_build_object('en', name, 'fr', '', 'es', '', 'it', '');`),
    knex.raw(`alter table omh.layers alter column description type jsonb USING jsonb_build_object('en', description, 'fr', '', 'es', '', 'it', '');`),
    knex.raw(`alter table omh.layers alter column source type jsonb USING jsonb_build_object('en', source, 'fr', '', 'es', '', 'it', '');`),
    knex.raw(`alter table omh.groups alter column name type jsonb USING jsonb_build_object('en', name, 'fr', '', 'es', '', 'it', '');`),
    knex.raw(`alter table omh.groups alter column description type jsonb USING jsonb_build_object('en', description, 'fr', '', 'es', '', 'it', '');`),
    knex.raw(`alter table omh.maps alter column title type jsonb USING jsonb_build_object('en', title, 'fr', '', 'es', '', 'it', '');`),

    // replace search indexes until we can migrate to elasticsearch
    knex.raw(`CREATE INDEX layers_text_search_idx ON omh.layers USING GIN (to_tsvector('english', (name -> 'en')::text || ' ' || COALESCE((description -> 'en')::text, '') || ' ' || COALESCE((source -> 'en')::text, '')));`),
    knex.raw(`CREATE INDEX layers_text_search_fr_idx ON omh.layers USING GIN (to_tsvector('french', (name -> 'fr')::text || ' ' || COALESCE((description -> 'fr')::text, '') || ' ' || COALESCE((source -> 'fr')::text, '')));`),
    knex.raw(`CREATE INDEX layers_text_search_es_idx ON omh.layers USING GIN (to_tsvector('spanish', (name -> 'es')::text || ' ' || COALESCE((description -> 'es')::text, '') || ' ' || COALESCE((source -> 'es')::text, '')));`),
    knex.raw(`CREATE INDEX layers_text_search_it_idx ON omh.layers USING GIN (to_tsvector('italian', (name -> 'it')::text || ' ' || COALESCE((description -> 'it')::text, '') || ' ' || COALESCE((source -> 'it')::text, '')));`),

    knex.raw(`CREATE INDEX groups_text_search_idx ON omh.groups USING GIN (to_tsvector('english', group_id || ' ' || (name -> 'en')::text || ' ' || COALESCE(location, '') || ' ' || COALESCE((description -> 'en')::text, '')));`),
    knex.raw(`CREATE INDEX groups_text_search_fr_idx ON omh.groups USING GIN (to_tsvector('french', group_id || ' ' || (name -> 'fr')::text || ' ' || COALESCE(location, '') || ' ' || COALESCE((description -> 'fr')::text, '')));`),
    knex.raw(`CREATE INDEX groups_text_search_es_idx ON omh.groups USING GIN (to_tsvector('spanish', group_id || ' ' || (name -> 'es')::text || ' ' || COALESCE(location, '') || ' ' || COALESCE((description -> 'es')::text, '')));`),
    knex.raw(`CREATE INDEX groups_text_search_it_idx ON omh.groups USING GIN (to_tsvector('italian', group_id || ' ' || (name -> 'it')::text || ' ' || COALESCE(location, '') || ' ' || COALESCE((description -> 'it')::text, '')));`),

    knex.raw(`CREATE INDEX maps_text_search_idx ON omh.maps USING GIN (to_tsvector('english', (title -> 'en')::text));`),
    knex.raw(`CREATE INDEX maps_text_search_fr_idx ON omh.maps USING GIN (to_tsvector('french', (title -> 'fr')::text));`),
    knex.raw(`CREATE INDEX maps_text_search_es_idx ON omh.maps USING GIN (to_tsvector('spanish', (title -> 'es')::text));`),
    knex.raw(`CREATE INDEX maps_text_search_it_idx ON omh.maps USING GIN (to_tsvector('italian', (title -> 'it')::text));`)
  ])
}

exports.down = function () {
  return Promise.resolve()
}
