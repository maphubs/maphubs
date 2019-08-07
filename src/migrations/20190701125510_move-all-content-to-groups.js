
exports.up = async (knex) => {
  await knex.raw(`ALTER TABLE omh.stories ADD COLUMN owned_by_group_id text;`)
  await knex.raw(`ALTER TABLE omh.stories ADD COLUMN updated_by bigint;`)
  await knex.raw(`UPDATE omh.stories SET updated_by = user_id;`)
  // move hub stories to group
  const hubs = await knex('omh.hubs').select('hub_id', 'owned_by_group_id')
  await Promise.all(hubs.map(async (hub) => {
    const owned_by_group_id = hub.owned_by_group_id
    const stories = await knex('omh.hub_stories').select().where({hub_id: hub.hub_id})
    return Promise.all(stories.map(async (story) => {
      return knex('omh.stories').update({owned_by_group_id}).where({story_id: story.story_id})
    }))
  }))

  const users = await knex('users').select('id', 'display_name')
  return Promise.all(users.map(async (user) => {
    // check if user has stories or maps
    const userStories = await knex('omh.user_stories').where({user_id: user.id})
    const userMaps = await knex('omh.maps').where({owned_by_user_id: user.id})
    if ((userStories && userStories.length > 0) || (userMaps && userMaps.length > 0)) {
      // check if the user name is available as a group
      let targetGroup = user.display_name
      const existingGroup = await knex('omh.groups').select()
        .whereRaw('lower(group_id) = ?', targetGroup.toLowerCase())
      if (existingGroup && existingGroup.length > 0) {
        targetGroup = `${targetGroup}2`
      }
      // create the group
      await knex('omh.groups').insert({
        group_id: targetGroup,
        name: {en: targetGroup},
        description: {en: targetGroup},
        location: 'Global',
        published: true,
        featured: false,
        unofficial: false,
        tier_id: 'public'
      })

      // add user as admin of the group
      await knex('omh.group_memberships').insert({
        group_id: targetGroup,
        user_id: user.id,
        role: 'Administrator'
      })

      // move user stories to group
      await Promise.all(userStories.map(async (story) => {
        return knex('omh.stories').update({owned_by_group_id: targetGroup}).where({story_id: story.story_id})
      }))

      // move user maps to a group
      return Promise.all(userMaps.map(async (map) => {
        return knex('omh.maps').update({owned_by_group_id: targetGroup}).where({map_id: map.map_id})
      }))
    }
  }))
}

exports.down = async (knex) => {
  return null
}
