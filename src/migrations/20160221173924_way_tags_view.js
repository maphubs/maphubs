
exports.up = function(knex) {

  return knex.raw(`
    create view global_way_tags as
    SELECT
    way_id,
    CASE WHEN count(k) = 0
    THEN NULL
    ELSE hstore(array_agg(k::text),array_agg(v::text))
    END AS tags
    FROM current_way_tags
    GROUP BY way_id;
`);

};

exports.down = function(knex) {
  return knex.raw(`drop view global_way_tags;`);
};
