
exports.up = (knex) => {
  return knex('omh.layers').update({status: 'published'})
}

exports.down = () => {
  return Promise.resolve()
}
