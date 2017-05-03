
exports.up = function(knex, Promise) {
    return  knex.raw(`
    INSERT INTO omh.page (page_id, config) VALUES ('header', '{"logoLinkUrl": "/"}');
    `);
};

exports.down = function(knex, Promise) {
  
};
