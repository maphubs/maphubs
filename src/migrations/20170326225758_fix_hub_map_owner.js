
exports.up = function (knex) {
  return knex.raw(`
    UPDATE omh.maps SET owned_by_group_id = p.owned_by_group_id
FROM omh.maps AS m,
(SELECT a.map_id, a.hub_id, a.owned_by_group_id 
FROM omh.hubs a LEFT JOIN omh.maps b on a.map_id = b.map_id 
WHERE b.owned_by_group_id IS NULL AND b.owned_by_user_id IS NULL) as p
WHERE m.map_id = p.map_id;
  `)
}

exports.down = function () {
  return Promise.resolve()
}
