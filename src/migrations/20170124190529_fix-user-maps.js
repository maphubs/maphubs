
exports.up = function(knex, Promise) {
  return knex.raw(`ALTER TABLE omh.maps ADD COLUMN owned_by_user_id bigint;`)
    .then(function(){
      return  knex.raw(`
        UPDATE omh.maps a SET owned_by_user_id = b.user_id
        FROM omh.user_maps AS b
        WHERE a.map_id = b.map_id;
      `);
    });
};

exports.down = function(knex, Promise) {
  
};
