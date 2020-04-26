
exports.up = function (knex) {
  return Promise.all([
    knex.raw(`INSERT INTO omh.account_tiers
    (tier_id, name, available, private_layer_limit, private_map_limit, private_hub_limit, allow_custom_branding)   
    VALUES ('public', 'Public', false, 0, 0, 0, false)
    ;`),
    knex.raw('UPDATE omh.groups SET tier_id = \'public\'')
  ])
}

exports.down = function (knex) {
  return Promise.all([
    knex.raw('UPDATE omh.groups SET tier_id = null'),
    knex.raw('DELETE FROM omh.account_tiers where tier_id = \'public\'')
  ])
}
