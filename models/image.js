/* @flow weak */
var knex = require('../connection.js');
var debug = require('../services/debug')('model/image');

module.exports = {

  getImageByID(image_id){
    return knex('omh.images').where({image_id})
    .then(function(result) {
      if (result && result.length == 1) {
        return result[0];
      }
      //else
      return null;
    });
  },

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

    });
  },

  setGroupImage(group_id, image, info){
    return knex.transaction(function(trx) {
      return trx('omh.group_images')
      .whereRaw('lower(group_id) = ?', group_id.toLowerCase())
      .del()//delete the existing group image
      .then(function(){
        return trx('omh.images').insert({image, info}).returning('image_id')
        .then(function(image_id){
          image_id = parseInt(image_id);
          return trx('omh.group_images').insert({group_id, image_id});
        });
      });
    });
  },

  removeGroupImage(group_id, image_id){
    return knex.transaction(function(trx) {
      return trx('omh.group_images')
      .whereRaw('lower(group_id) = ? AND image_id = ?', [group_id.toLowerCase(), image_id])
      .del();
    });
  },

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
      }else{
        throw new Error('No Image Found for Hub: '+ hub_id);
      }

    });
  },

  setHubImage(hub_id, image, info, type){
    return knex.transaction(function(trx) {
      return trx('omh.hub_images')
      .whereRaw('lower(hub_id) = ? AND type = ?', [hub_id.toLowerCase(), type])
      .del()//only one hub image per type, delete the existing one
      .then(function(){
        return trx('omh.images').insert({image, info}).returning('image_id')
        .then(function(image_id){
          image_id = parseInt(image_id);
          return trx('omh.hub_images').insert({hub_id, image_id, type});
        });
      });
    });
  },

  removeHubImage(hub_id, image_id){
    return knex.transaction(function(trx) {
      return trx('omh.hub_images')
      .whereRaw('lower(hub_id) = ? AND image_id = ?', [hub_id.toLowerCase(), image_id])
      .del();
    });
  },

  removeHubImageByType(hub_id, type){
    return knex.transaction(function(trx) {
      return trx('omh.hub_images')
      .whereRaw('lower(hub_id) = ? AND type = ?', [hub_id.toLowerCase(), type])
      .del();
    });
  },

  updateImage(image_id, image, info){
    return knex('omh.images').update({image, info}).where({image_id});
  }

};
