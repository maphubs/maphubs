
exports.up = function(knex, Promise) {
  return knex('omh.layers').update({status: 'published'});
};

exports.down = function(knex, Promise) {
  return;
};
