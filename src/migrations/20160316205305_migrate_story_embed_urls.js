
exports.up = function(knex, Promise) {
  return knex('omh.stories').select('story_id', 'body')
  .then(function(stories){
      var updateCommands = [];
      stories.forEach(function(story){
        if(story.body){
          var body = story.body.replace(/beta\.maphubs\.com/g, 'maphubs.com');
          updateCommands.push(knex('omh.stories').update({body}).where({story_id: story.story_id}));
        }
      });
      return Promise.all(updateCommands);
  });
};

exports.down = function(knex, Promise) {

};
