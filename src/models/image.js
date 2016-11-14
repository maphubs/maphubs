/* @flow weak */
var knex = require('../connection.js');
var debug = require('../services/debug')('model/image');
var ImageUtils = require('../services/image-utils');
var Promise = require('bluebird');

module.exports = {

  getImageByID(image_id){
    return knex('omh.images').select('image_id','image').where({image_id})
    .then(function(result) {
      if (result && result.length == 1) {
        return result[0];
      }
      //else
      return null;
    });
  },

  getThumbnailImageByID(image_id){
    return knex('omh.images').select('image_id','thumbnail').where({image_id})
    .then(function(result) {
      if (result && result.length == 1) {
        return result[0];
      }
      //else
      return null;
    });
  },

  /////////////
  // Groups
  ////////////

  getGroupImage(group_id){
    debug('get image for group: ' + group_id);
    var _this = this;
    return knex('omh.group_images').select('image_id')
    .whereRaw('lower(group_id) = ?', group_id.toLowerCase())
    .then(function(result){
      if(result.length == 1){
        var id = result[0].image_id;
        debug('image found: ' + id);
        return _this.getImageByID(parseInt(id));
      }else{
        //throw new Error('No Image Found for Group: '+ group_id);
      }
      return null;

    });
  },

  getGroupThumbnail(group_id){
    debug('get image for group: ' + group_id);
    var _this = this;
    return knex('omh.group_images').select('image_id')
    .whereRaw('lower(group_id) = ?', group_id.toLowerCase())
    .then(function(result){
      if(result.length == 1){
        var id = result[0].image_id;
        debug('image found: ' + id);
        return _this.getThumbnailImageByID(parseInt(id));
      }else{
        //throw new Error('No Image Found for Group: '+ group_id);
      }
      return null;

    });
  },


  insertGroupImage(group_id, image, info, trx){
    return ImageUtils.resizeBase64(image, 40, 40)
      .then(function(thumbnail){
        return trx('omh.images').insert({image, thumbnail, info}).returning('image_id')
        .then(function(image_id){
          image_id = parseInt(image_id);
          return trx('omh.group_images').insert({group_id, image_id});
        });
    });
  },

  setGroupImage(group_id, image, info){
    var _this = this;
      return knex.transaction(function(trx) {
        return trx('omh.group_images').select('image_id')
        .whereRaw('lower(group_id) = ?', group_id.toLowerCase())
        .then(function(result){
          if(result && result.length > 0){
            //delete the existing group image
            return trx('omh.group_images').where({image_id: result[0].image_id}).del()
            .then(function(){
              return trx('omh.images').where({image_id: result[0].image_id}).del()
              .then(function(){
                return _this.insertGroupImage(group_id, image, info, trx);
              });
            });
          }else{
            return _this.insertGroupImage(group_id, image, info, trx);
          }
        });
      });
  },

  /////////////
  // Hubs
  ////////////

  getHubImage(hub_id, type="logo"){
    debug('get image for hub: ' + hub_id);
    var _this = this;
    return knex('omh.hub_images').select('image_id')
    .whereRaw('lower(hub_id) = ? AND type = ?', [hub_id.toLowerCase(), type])
    .then(function(result){
      if(result.length == 1){
        var id = result[0].image_id;
        debug('image found: ' + id);
        return _this.getImageByID(parseInt(id));
      }else if(result.length > 1){
        id = result[0].image_id;
        debug('multiple images found!');
        return _this.getImageByID(parseInt(id));
      }else{
        throw new Error('No Image Found for Hub: '+ hub_id);
      }
    });
  },

  getHubThumbnail(hub_id, type="logo"){
    debug('get image for hub: ' + hub_id);
    var _this = this;
    return knex('omh.hub_images').select('image_id')
    .whereRaw('lower(hub_id) = ? AND type = ?', [hub_id.toLowerCase(), type])
    .then(function(result){
      if(result.length == 1){
        var id = result[0].image_id;
        debug('image found: ' + id);
        return _this.getThumbnailImageByID(parseInt(id));
      }else{
        throw new Error('No Image Found for Hub: '+ hub_id);
      }

    });
  },

  insertHubImage(hub_id, image, info, type, trx){
    if(type == 'logo'){
      return ImageUtils.resizeBase64(image, 72, 72) //for @2x story logos shown at 36x36
      .then(function(thumbnail){
        return trx('omh.images').insert({image, thumbnail, info}).returning('image_id')
        .then(function(image_id){
          image_id = parseInt(image_id);
          return trx('omh.hub_images').insert({hub_id, image_id, type});
        });
      });
    }else if(type == 'banner'){
      return ImageUtils.resizeBase64(image, 400, 300, true)
      .then(function(thumbnail){
        return trx('omh.images').insert({image, thumbnail, info}).returning('image_id')
        .then(function(image_id){
          image_id = parseInt(image_id);
          return trx('omh.hub_images').insert({hub_id, image_id, type});
        });
      });
    }
  },

  //delete prev image if there is one, then insert
  setHubImage(hub_id, image, info, type){
    var _this = this;
    return knex.transaction(function(trx) {
      return trx('omh.hub_images').select('image_id')
      .whereRaw('lower(hub_id) = ? AND type = ?', [hub_id.toLowerCase(), type])
      .then(function(result){
        if(result && result.length > 0){
          //only one hub image per type, delete the existing one
          return trx('omh.hub_images').where({image_id:result[0].image_id}).del()
          .then(function(){
            return trx('omh.images').where({image_id:result[0].image_id}).del()
            .then(function(){
              return _this.insertHubImage(hub_id, image, info, type, trx);
            });
          });
        }else{
          return _this.insertHubImage(hub_id, image, info, type, trx);
        }
    });
    });
  },

  /////////////
  // Stories
  ////////////

  getStoryImage(story_id, image_id){
    debug('get image for story: ' + story_id);
    var _this = this;
    return knex('omh.story_images').select('image_id').where({story_id, image_id})
    .then(function(result){
      if(result.length == 1){
        debug('image found: ' + image_id);
        return _this.getImageByID(image_id);
      }else{
        throw new Error('No Image Found for Story: '+ story_id);
      }
    });
  },

  getStoryThumbnail(story_id, image_id){
    debug('get image for story: ' + story_id);
    var _this = this;
    return knex('omh.story_images').select('image_id').where({story_id, image_id})
    .then(function(result){
      if(result.length == 1){
        debug('image found: ' + image_id);
        return _this.getThumbnailImageByID(image_id);
      }else{
        throw new Error('No Image Found for Story: '+ story_id);
      }
    });
  },

  addStoryImage(story_id, image, info){
    return knex.transaction(function(trx) {
      return ImageUtils.resizeBase64(image, 800, 240, true)
      .then(function(thumbnail){
        return trx('omh.images').insert({image, thumbnail, info}).returning('image_id')
        .then(function(image_id){
          image_id = parseInt(image_id);
          return trx('omh.story_images').insert({story_id, image_id})
          .then(function(){
            return image_id;
          });
        });
      });
    });
  },

  removeStoryImage(story_id, image_id){
    return knex.transaction(function(trx) {
      return trx('omh.story_images').where({story_id, image_id}).del()
      .then(function(){
        return trx('omh.images').where({image_id}).del();
      });
    });
  },

  removeAllStoryImages(story_id, trx){
      return trx('omh.story_images').select('image_id').where({story_id})
      .then(function(results){
        var commands = [];
        results.forEach(function(result){
          commands.push(
            trx('omh.story_images').where({story_id, image_id: result.image_id}).del()
            .then(function(){
              return trx('omh.images').where({image_id: result.image_id}).del();
            })
          );
        });
        return Promise.all(commands);
      });
  }

};
