
exports.up = function(knex, Promise) {
  return Promise.all([
  knex.raw(`ALTER TABLE omh.hubs ADD COLUMN map_id int;`),
  knex.raw(`ALTER TABLE omh.hubs ADD FOREIGN KEY(map_id) REFERENCES omh.maps(map_id);`)
  ]);
};

exports.down = function() {
  
};
