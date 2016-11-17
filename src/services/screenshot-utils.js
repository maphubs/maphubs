var request = require('superagent-bluebird-promise');
var debug = require('../services/debug')('screenshot-utils');
var local = require('../local');
var log = require('../services/log.js');
var knex = require('../connection.js');
var urlUtil = require('../services/url-util');

module.exports = {

  base64Download(url, data){
    return request.post(url)
    .type('json')
    .send(data)
    .timeout(60000)
    .then(function(res) {
      return res.body.toString('base64');
    });
  },

  getLayerThumbnail(layer_id){
    var _this = this;
    debug('get thumbnail image for layer: ' + layer_id);
    return knex('omh.layers').select('thumbnail').where({layer_id})
    .then(function(result){
      if(result && result.length == 1 && result[0].thumbnail != null && result[0].thumbnail.length > 0){
        debug('found image in database for layer: ' + layer_id);
        return result[0].thumbnail;
      }else{
        debug('no image in database for layer: ' + layer_id);
        return _this.updateLayerThumbnail(layer_id);
      }
    });
  },

  updateLayerThumbnail(layer_id){
    debug('updating image for layer: ' + layer_id);
    //get screenshot from the manet service
    //generate 640x480 and then display at 320x240 for retina
    var width = 400;
    var height = 300;

    var baseUrl = urlUtil.getBaseUrl(); //use internal route
    var maphubsUrl = baseUrl + '/api/layer/' + layer_id + '/static/render/';
    var manetUrl = local.manetUrl;
    var manetData = {
      url: maphubsUrl,
      width,
      height,
      force: true,
      delay: 15000,
      zoom: 1,
      format: 'jpg',
      quality: 0.8,
      cookies: [{
        name: 'manet',
        value: local.manetAPIKey,
        domain: local.host,
        path: "/"
      }]
    };

    debug(JSON.stringify(manetData));
    //replace image in database

    return this.base64Download(manetUrl, manetData)
    .then(function(image){
      return knex('omh.layers').update({thumbnail: image}).where({layer_id})
      .then(function(){
        return image;
      });
    });

  },

  reloadLayerThumbnail(layer_id){
      return knex('omh.layers').update({thumbnail: null}).where({layer_id})
      .then(function(){
        var baseUrl = urlUtil.getBaseUrl();
        var url = baseUrl + '/api/screenshot/layer/thumbnail/' + layer_id + '.jpg';
        //note: returning the promise here on purpose, we don't want to wait for this to finish
        request.get(url).timeout(60000).catch(function(err){
          debug('thumbnail request complete');
          if(err){log.error(err);}
        });
        return true;
      });
  },

  getMapImage(map_id){
    var _this = this;
    debug('get screenshot image for map: ' + map_id);
    return knex('omh.maps').select('screenshot').where({map_id})
    .then(function(result){
      if(result && result.length == 1 && result[0].screenshot != null && result[0].screenshot.length > 0){
        debug('found image in database for map: ' + map_id);
        return result[0].screenshot;
      }else{
        debug('no image in database for map: ' + map_id);
        return _this.updateMapImage(map_id);
      }
    });
  },

  updateMapImage(map_id){
    debug('updating image for map: ' + map_id);
    //get screenshot from the manet service
    var width = 1200;
    var height = 630;

    var baseUrl = urlUtil.getBaseUrl();
    var maphubsUrl =  baseUrl + '/api/map/' + map_id + '/static/render/';
    //var maphubsUrl = 'http://map.loggingroads.org';


    var manetUrl = local.manetUrl;

    var manetData = {
      url: maphubsUrl,
      width,
      height,
      force: true,
      delay: 15000,
      zoom: 1.25,
      format: 'png',
      quality: 1,
      cookies: [{
        name: 'manet',
        value: local.manetAPIKey,
        domain: local.host,
        path: "/"
      }]
    };

    debug(JSON.stringify(manetData));
    //replace image in database
    return this.base64Download(manetUrl, manetData)
    .then(function(image){
      return knex('omh.maps').update({screenshot: image}).where({map_id})
      .then(function(){
        return image;
      });
    });
  },

  updateMapThumbnail(map_id){
    debug('updating thumbnail for map: ' + map_id);
    //get screenshot from the manet service
    var width = 400;
    var height = 300;

    var baseUrl = urlUtil.getBaseUrl();
    var maphubsUrl =  baseUrl + '/api/map/' + map_id + '/static/render/thumbnail';
    var manetUrl = local.manetUrl;

    var manetData = {
      url: maphubsUrl,
      width,
      height,
      force: true,
      delay: 15000,
      zoom: 1,
      format: 'jpg',
      quality: 0.8,
      cookies: [{
        name: 'manet',
        value: local.manetAPIKey,
        domain: local.host,
        path: "/"
      }]
    };

    debug(JSON.stringify(manetData));

    //replace image in database
    debug(manetUrl);
    return this.base64Download(manetUrl, manetData)
    .then(function(image){
      return knex('omh.maps').update({thumbnail: image}).where({map_id})
      .then(function(){
        return image;
      });
    });
  },

  getMapThumbnail(map_id){
    var _this = this;
    debug('get thumbnail image for map: ' + map_id);
    return knex('omh.maps').select('thumbnail').where({map_id})
    .then(function(result){
      if(result && result.length == 1 && result[0].thumbnail != null && result[0].thumbnail.length > 0){
        debug('found image in database for map: ' + map_id);
        return result[0].thumbnail;
      }else{
        debug('no image in database for map: ' + map_id);
        return _this.updateMapThumbnail(map_id);
      }
    });
  },

  returnImage(image, req, res){
    var img = new Buffer(image, 'base64');
    var hash = require('crypto').createHash('md5').update(img).digest("hex");
    var match = req.get('If-None-Match');
    if(hash == match){
      res.status(304).send();
    }else{
      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': img.length,
        'ETag': hash
      });
      res.end(img);
    }
  }


};
