
exports.up = function (knex, Promise) {
  return Promise.all([
    knex.raw(`
      CREATE TABLE omh.account_tiers (
        tier_id text,
        name text,
        available boolean,
        monthly_fee_usd int,
        addon_user_fee_usd int,
        user_limit int,
        private_layer_limit int,
        private_map_limit int,
        private_hub_limit int,
        allow_custom_branding boolean,       
        PRIMARY KEY (tier_id)
      )
  `),
    knex.raw(`ALTER TABLE omh.groups ADD COLUMN tier_id text;`),
    knex.raw(`ALTER TABLE omh.groups ADD COLUMN account_id text;`),
    knex.raw(`ALTER TABLE omh.groups ADD FOREIGN KEY(tier_id) REFERENCES omh.account_tiers(tier_id);`)
  ])
}

exports.down = function (knex, Promise) {
  return Promise.all([
    knex.raw(`ALTER TABLE omh.groups DROP COLUMN tier_id;`),
    knex.raw(`ALTER TABLE omh.groups DROP COLUMN account_id;`),
    knex.raw(`DROP TABLE omh.account_tiers;`)
  ])
}
