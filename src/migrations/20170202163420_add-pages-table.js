
exports.up = function(knex, Promise) {
   return Promise.all([
     knex.raw(`
        CREATE TABLE omh.page (
          page_id text,
          config json  NOT NULL DEFAULT '{}',
          PRIMARY KEY (page_id)
        );
    `),
    knex.raw(`
        INSERT INTO omh.page (page_id, config) VALUES ('home', '{"components":[]}')
    `),
   ]);
};

exports.down = function() {
  
};
