exports.up = async (knex) => {
  return knex.raw(`
   INSERT INTO nextauth_users (id, email, created_at, updated_at, role)
   SELECT nextval('nextauth_users_id_seq'), email, creation_time, now(), 'member' from users
  `)
}

exports.down = function (knex) {}
