
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.raw(`ALTER TABLE omh.layers ADD COLUMN settings json;`),
        knex.raw(`ALTER TABLE omh.map_layers ADD COLUMN settings json;`),
        knex.raw(`ALTER TABLE omh.hub_layers ADD COLUMN settings json;`)
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.raw(`ALTER TABLE omh.layers DROP COLUMN settings;`),
        knex.raw(`ALTER TABLE omh.map_layers DROP COLUMN settings;`),
        knex.raw(`ALTER TABLE omh.hub_layers DROP COLUMN settings;`)
    ]);
};
