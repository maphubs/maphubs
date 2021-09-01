exports.up = async (knex) => {
  await knex.raw(`
   INSERT INTO nextauth_users (id, email, created_at, updated_at, role)
   SELECT id, email, creation_time, now(), 'member' from users
  `)
  return knex.raw(`
  SELECT setval('nextauth_users_id_seq',(SELECT GREATEST(MAX(id)+1,nextval('nextauth_users_id_seq'))-1 FROM nextauth_users))`)
}

exports.down = function (knex) {}
