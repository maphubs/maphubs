
exports.up = function (knex, Promise) {
  return knex.select().from('omh.hubs')
    .then((hubs) => {
      var commands = []
      hubs.forEach((hub) => {
        commands.push(
          knex('omh.maps')
            .insert({
              position: hub.map_position,
              style: hub.map_style,
              basemap: hub.basemap,
              title: hub.name,
              private: hub.private,
              created_by: hub.created_by,
              created_at: hub.created_at,
              updated_by: hub.updated_by,
              updated_at: knex.raw('now()')
            }).returning('map_id')
            .then((result) => {
              var map_id = result[0]
              return knex('omh.hubs').update({map_id: map_id}).where({hub_id: hub.hub_id})
                .then(() => {
                  return knex.raw(`
          INSERT INTO omh.map_layers select ${map_id}, layer_id, style, legend_html from omh.hub_layers where hub_id = '${hub.hub_id}';
          `)
                })
            }))
      })
      return Promise.all(commands)
    })
}

exports.down = function () {
  return Promise.resolve()
}
