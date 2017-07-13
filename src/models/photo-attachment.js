// @flow
var knex = require('../connection.js');
var Promise = require('bluebird');
var Presets = require('./presets');
var MapStyles = require('../components/Map/Styles');
var log = require('../services/log');

module.exports = {

  getPhotoAttachment(photo_id: number, trx: any=null){
    let db = knex;
    if(trx){db = trx;}
    return db('omh.photo_attachments').where({photo_id})
    .then((result) => {
      if(result && result.length > 0){
        return result[0];
      }
      return null;
    });
  },

  getPhotoIdsForFeature(layer_id: number, mhid: string, trx: any=null){
    let db = knex;
    if(trx){db = trx;}
    return db('omh.feature_photo_attachments').select('omh.photo_attachments.photo_id')
    .leftJoin('omh.photo_attachments', 'omh.feature_photo_attachments.photo_id', 'omh.photo_attachments.photo_id')
    .where({layer_id, mhid});
  },

  getPhotoAttachmentsForFeature(layer_id: number, mhid: string, trx: any=null){
    let db = knex;
    if(trx){db = trx;}
    return db('omh.feature_photo_attachments').select('omh.photo_attachments.*')
    .leftJoin('omh.photo_attachments', 'omh.feature_photo_attachments.photo_id', 'omh.photo_attachments.photo_id')
    .where({layer_id, mhid});
  },

  setPhotoAttachment(layer_id: number, mhid: string, data: string, info: string, user_id: number, trx: any=null){
    var _this = this;
    return this.getPhotoAttachmentsForFeature(layer_id, mhid, trx)
    .then((results) => {
      if(results && results.length > 0){
        var commands = [];
        results.forEach((result) => {
          commands.push(_this.deletePhotoAttachment(layer_id, mhid, result.photo_id, trx));
        });
        return Promise.all(commands)
        .then(() => {
          return _this.addPhotoAttachment(layer_id, mhid, data, info, user_id, trx);
        });
      }else{
        return _this.addPhotoAttachment(layer_id, mhid, data, info, user_id, trx);
      }
    });
  },

  addPhotoAttachment(layer_id: number, mhid: string, data: string, info: string, user_id: number, trx: any=null){
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
    .then((photo_id) => {
      photo_id = parseInt(photo_id);
      return db('omh.feature_photo_attachments').insert({layer_id, mhid, photo_id})
      .then(() => {
        return photo_id;
      });
    });
  },

  updatePhotoAttachment(photo_id: number, data: string, info: string, trx: any=null){
    let db = knex;
    if(trx){db = trx;}
    return db('omh.photo_attachments').update({data, info}).where({photo_id});
  },

  deletePhotoAttachment(layer_id: number, mhid: string, photo_id: number, trx: any=null){
    let db = knex;
    if(trx){db = trx;}
    return db('omh.feature_photo_attachments')
    .where({layer_id, mhid, photo_id}).del()
    .then(() => {
      return db('omh.photo_attachments').where({photo_id}).del();
    });
  },

  //need to call this before deleting a layer
  removeAllLayerAttachments(layer_id: number, trx: any=null){
    var _this = this;
    let db = knex;
    if(trx){db = trx;}  
    return db('omh.feature_photo_attachments').where({layer_id})
    .then((featurePhotoAttachments) => {
       return Promise.map(featurePhotoAttachments, fpa => {
          return _this.deletePhotoAttachment(layer_id, fpa.mhid, fpa.photo_id);
       });  
    });
  },

  addPhotoUrlPreset(layer: Object, user_id: number, trx: any){

    let style = layer.style;
    if(style){
       let firstSource:string = Object.keys(style.sources)[0];

      if(firstSource){
        let presets = MapStyles.settings.getSourceSetting(style, firstSource, 'presets');
        if(presets){
          var maxId = 0;
    var alreadyPresent = false;
    presets.forEach((preset) => {
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
        return new Promise((resolve) => {
          resolve(presets);
        });
        }else{
          presets.push({
            tag: 'photo_url',
            label: {en: 'Photo URL'},
            isRequired: false,
            type: 'text',
            id: maxId + 1
          });
          let updatedStyle = MapStyles.settings.setSourceSetting(style, firstSource, 'presets', presets);
          return Presets.savePresets(layer.layer_id, presets, user_id, false, trx)
          .then(() => {
            return trx('omh.layers').update({style: updatedStyle}).where({layer_id: layer.layer_id})
             .then(() => {
                return presets;
             });
          });
        }
        }else{
          log.error('layer missing style presets');
        }
      }else{
        log.error('layer missing style sources');
      }
    }else{
      log.error('layer missing style');
    }
  }

};
