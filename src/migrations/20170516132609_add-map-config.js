
exports.up = function(knex, Promise) {
   return  knex.raw(`
    INSERT INTO omh.page (page_id, config) VALUES ('map', '{}');
    `);
};

exports.down = function(knex, Promise) {
  
};
