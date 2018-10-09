
exports.up = function (knex) {
  return knex.raw(`
      CREATE TABLE omh.story_images (
        story_id int,
        image_id int,
        PRIMARY KEY (story_id, image_id),
        CONSTRAINT storyimagesstoriesfk FOREIGN KEY (story_id)
              REFERENCES omh.stories (story_id),
        CONSTRAINT storyimagesimagesfk FOREIGN KEY (image_id)
              REFERENCES omh.images (image_id)
      )
  `)
}

exports.down = function (knex) {
  return knex.raw(`DROP TABLE omh.story_images`)
}
