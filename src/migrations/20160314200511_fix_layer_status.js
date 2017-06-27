
exports.up = function(knex) {
  return knex('omh.layers').update({status: 'published'});
};

exports.down = function() {
  return;
};
