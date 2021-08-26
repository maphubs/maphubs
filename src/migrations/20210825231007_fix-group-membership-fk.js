exports.up = async (knex) => {
  await knex.raw(
    `ALTER TABLE omh.group_memberships DROP CONSTRAINT groupmembershipuserfk`
  )
  return knex.raw(
    `ALTER TABLE omh.group_memberships ADD CONSTRAINT groupmembershipuserfk FOREIGN KEY (user_id) REFERENCES nextauth_users (id)`
  )
}

exports.down = async (knex) => {}
