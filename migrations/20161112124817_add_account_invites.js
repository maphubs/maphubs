exports.up = function(knex, Promise) {
  return knex.raw(`
      CREATE TABLE omh.account_invites (
        email text,
        key text,
        used boolean
        PRIMARY KEY (email, key)
      )
  `);
};

exports.down = function(knex, Promise) {
  return knex.raw(`DROP TABLE omh.account_invites`);
};
