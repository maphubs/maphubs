var knex = require('../connection.js');
var Promise = require('bluebird');
var Layer = require('./layer');

module.exports = {

  getPhotoAttachment(photo_id, trx=null){
    let db = knex;
    if(trx){db = trx;}
    return db('omh.photo_attachments').where({photo_id})
    .then(function(result){
      if(result && result.length > 0){
        return result[0];
      }
      return null;
    });
  },

  getPhotoIdsForFeature(layer_id, osm_id, trx=null){
    let db = knex;
    if(trx){db = trx;}
    return db('omh.feature_photo_attachments').select('omh.photo_attachments.photo_id')
    .leftJoin('omh.photo_attachments', 'omh.feature_photo_attachments.photo_id', 'omh.photo_attachments.photo_id')
    .where({layer_id, osm_id});
  },

  getPhotoAttachmentsForFeature(layer_id, osm_id, trx=null){
    let db = knex;
    if(trx){db = trx;}
    return db('omh.feature_photo_attachments').select('omh.photo_attachments.*')
    .leftJoin('omh.photo_attachments', 'omh.feature_photo_attachments.photo_id', 'omh.photo_attachments.photo_id')
    .where({layer_id, osm_id});
  },

  setPhotoAttachment(layer_id, osm_id, data, info, user_id, trx=null){
    var _this = this;
    return this.getPhotoAttachmentsForFeature(layer_id, osm_id, trx)
    .then(function(results){
      if(results && results.length > 0){
        var commands = [];
        results.forEach(function(result){
          commands.push(_this.deletePhotoAttachment(layer_id, osm_id, result.photo_id, trx));
        });
        return Promise.all(commands)
        .then(function(){
          return _this.addPhotoAttachment(layer_id, osm_id, data, info, user_id, trx);
        });
      }else{
        return _this.addPhotoAttachment(layer_id, osm_id, data, info, user_id, trx);
      }
    });
  },

  addPhotoAttachment(layer_id, osm_id, data, info, user_id, trx=null){
    let db = knex;
    if(trx){db = trx;}
    return db('omh.photo_attachments')
    .insert({
      data,
      info,
      created_by: user_id,
      created_at: knex.raw('now()')
    })
    .returning('photo_id')
    .then(function(photo_id){
      photo_id = parseInt(photo_id);
      return db('omh.feature_photo_attachments').insert({layer_id, osm_id, photo_id})
      .then(function(){
        return photo_id;
      });
    });
  },

  updatePhotoAttachment(photo_id, data, info, trx=null){
    let db = knex;
    if(trx){db = trx;}
    return db('omh.photo_attachments').update({data, info}).where({photo_id});
  },

  deletePhotoAttachment(layer_id, osm_id, photo_id, trx=null){
    let db = knex;
    if(trx){db = trx;}
    return db('omh.feature_photo_attachments')
    .where({layer_id, osm_id, photo_id}).del()
    .then(function(){
      return db('omh.photo_attachments').where({photo_id}).del();
    });
  },

  //need to call this before deleting a layer
  removeAllLayerAttachments(layer_id, trx=null){
    var _this = this;
    let db = knex;
    if(trx){db = trx;}
    var commands = [];
    db('omh.feature_photo_attachments').where({layer_id})
    .then(function(featurePhotoAttachment){
      commands.push(
        _this.deletePhotoAttachment(featurePhotoAttachment.layer_id, featurePhotoAttachment.osm_id, featurePhotoAttachment.photo_id)
      );
    });
  },

  addPhotoUrlPreset(layer, user_id, trx){
    var presets = layer.presets;


    var maxId = 0;
    var alreadyPresent = false;
    presets.forEach(function(preset){
      if(preset.tag === 'photo_url'){
        alreadyPresent = true;
      }
      if(preset.id){
        if(preset.id > maxId){
          maxId = preset.id;
        }
      }
    });

    if(alreadyPresent){
      return new Promise(function(fulfill) {
        fulfill(presets);
      });
    }else{
      presets.push({
        tag: 'photo_url',
        label: 'Photo URL',
        isRequired: false,
        type: 'text',
        id: maxId + 1
      });
      return Layer.savePresets(layer.layer_id, presets, user_id, false, trx)
      .then(function(){
        return presets;
      });
    }
  }

};
