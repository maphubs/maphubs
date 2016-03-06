
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.raw(`ALTER TABLE omh.map_layers ADD COLUMN legend_html text;`),
    knex.raw(`ALTER TABLE omh.map_layers ADD COLUMN position int;`),
    knex.raw(`ALTER TABLE omh.hub_layers ADD COLUMN style json;`),
    knex.raw(`ALTER TABLE omh.hub_layers ADD COLUMN legend_html text;`),
    knex.raw(`ALTER TABLE omh.hub_layers ADD COLUMN position int;`)
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.raw(`ALTER TABLE omh.map_layers DROP COLUMN legend_html text;`),
    knex.raw(`ALTER TABLE omh.map_layers DROP COLUMN position int;`),
    knex.raw(`ALTER TABLE omh.hub_layers DROP COLUMN style json;`),
    knex.raw(`ALTER TABLE omh.hub_layers DROP COLUMN legend_html text;`),
    knex.raw(`ALTER TABLE omh.hub_layers DROP COLUMN position int;`)
  ]);
};
