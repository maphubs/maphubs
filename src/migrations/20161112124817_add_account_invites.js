/* eslint-disable unicorn/prefer-module */
exports.up = function (knex) {
  return Promise.all([
    knex.raw(`
        CREATE TABLE omh.account_invites (
          email text,
          key text,
          used boolean NOT NULL DEFAULT false,
          PRIMARY KEY (email, key)
        )
    `),
    knex.raw(`
        CREATE TABLE omh.admins (
          user_id bigint,
          PRIMARY KEY (user_id),
          CONSTRAINT adminsuserfk FOREIGN KEY (user_id)
                REFERENCES users (id)
        )
    `),
    knex('omh.admins').insert({ user_id: 1 })
  ])
}

exports.down = function (knex) {
  return Promise.all([
    knex.raw('DROP TABLE omh.account_invites'),
    knex.raw('DROP TABLE omh.admins')
  ])
}
