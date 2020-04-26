
exports.up = async (knex) => {
  // add user as admin of the group
  const groups = await knex('omh.groups').select('group_id')
  await Promise.all(groups.map(async group => {
    const memberResults = await knex('omh.group_memberships')
      .select('group_id', 'user_id')
      .where({group_id: group.group_id, user_id: 1})
    if (memberResults && memberResults.length === 0) {
      console.log(`addming MapHubs admin to group ${group.group_id}`)
      return knex('omh.group_memberships').insert({
        group_id: group.group_id,
        user_id: 1,
        role: 'Administrator'
      })
    } else {
      return Promise.resolve()
    }
  }))
}

exports.down = (knex) => {}
