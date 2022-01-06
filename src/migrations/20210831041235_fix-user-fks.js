exports.up = async (knex) => {
  await knex.raw(`ALTER TABLE omh.layers DROP CONSTRAINT layercreatedbyfk`)
  await knex.raw(`ALTER TABLE omh.layers DROP CONSTRAINT layerupdatedbyfk`)

  await knex.raw(
    `ALTER TABLE omh.layers ADD CONSTRAINT layercreatedbyfk FOREIGN KEY (created_by_user_id) REFERENCES nextauth_users (id)`
  )
  await knex.raw(
    `ALTER TABLE omh.layers ADD CONSTRAINT layerupdatedbyfk FOREIGN KEY (updated_by_user_id) REFERENCES nextauth_users (id)`
  )
}

exports.down = async (knex) => {}
