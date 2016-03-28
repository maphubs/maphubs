
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.raw(`UPDATE omh.maps SET thumbnail = null;`),
    knex.raw(`UPDATE omh.layers SET thumbnail = null;`)
  ]);
};

exports.down = function(knex, Promise) {

};
