//omh.layer_status_enum: "loaded"
exports.up = function(knex) {
  return knex.raw(`ALTER TYPE omh.layer_status_enum ADD VALUE 'loaded';`);
};

exports.down = function() {
  
};

exports.config = {transaction: false};
