
require('babel-core/register')({
  ignore: /assets.*|node_modules\/(?!(react-data-grid|react-disqus-thread|medium-editor|reflux-state-mixin|react-colorpickr)).*/
});
require('babel-polyfill');

var knex = require('../src/connection');
var data = require('./hubs.json');
var HubModel = require('../src/models/hub');
var MapModel = require('../src/models/map');
var LayerModel = require('../src/models/layer');
var ImageModel = require('../src/models/image');
var Promise = require('bluebird');

var log = require('winston');
var user_id = parseInt(data.user_id);

//customize this to either generate style from layers, or load a style from a file
var GET_STYLE_FROM_LAYERS = false;
var HUB_TEMPLATE = 'template';

log.info('Running Task: ' + data.task);

var commands = [];
//loop through districts
data.hubs.forEach(function(hub){
  var hub_id = hub.id.toLowerCase();
  var command = HubModel.createHub(hub_id, hub.name, true, false, user_id)
    .then(function(){
      log.info('Hub Created: ' + hub_id);
      return HubModel.getHubByID(HUB_TEMPLATE)
        .then(function(templateHub){
          log.info('Loaded Template Hub');   
          return HubModel.updateHub(hub_id, hub.name, hub.description, hub.tagline, true, templateHub.resources, "", user_id)
          .then(function(){
            log.info('Hub Updated');
            return LayerModel.getHubLayers(HUB_TEMPLATE, true)
            .then(function(layers){      
              log.info('Loaded Layers');
          
             var style;
              if(GET_STYLE_FROM_LAYERS){
                log.info('Building Style from Layers');
              style = MapModel.buildMapStyle(layers);
            }else{
              log.info('Using Template Hub Style');
              style = templateHub.map_style;
            }        
            return MapModel.saveHubMap(layers, style, data.baseMap, hub.mapPosition, hub_id, user_id)
            .then(function(){
              log.info('Saved Hub Map');
              //select image from omh.images a join omh.hub_images b ON a.image_id = b.image_id where b.hub_id = 'ingende' AND  b.type='logo';
              return knex('omh.images')
              .join('omh.hub_images', 'omh.hub_images.image_id', 'omh.images.image_id')
              .select('omh.images.image')
              .where({
                'omh.hub_images.type':'banner',
                'omh.hub_images.hub_id': HUB_TEMPLATE
                })            
              .then(function(bannerImageResult){
                var bannerImage;
                if(bannerImageResult[0] && bannerImageResult[0].image 
                && typeof bannerImageResult[0].image  === 'string'){
                   log.info('Extracted Template Banner Image');
                   bannerImage = bannerImageResult[0].image;
                }else{
                  throw new Error('missing banner image: ' + bannerImage);
                }
               
                return ImageModel.setHubImage(hub_id, bannerImage, {}, 'banner')
                .then(function(){
                   log.info('Saved Banner Image');
                   return knex('omh.images')
                  .join('omh.hub_images', 'omh.hub_images.image_id', 'omh.images.image_id')
                  .select('image')
                  .where({
                  'omh.hub_images.type':'logo',
                  'omh.hub_images.hub_id': HUB_TEMPLATE
                  }) 
                  .then(function(logoImageResult){
                    var logoImage;
                    if(logoImageResult[0] && logoImageResult[0].image 
                    && typeof logoImageResult[0].image  === 'string'){
                      log.info('Extracted Template Logo Image');
                      logoImage = logoImageResult[0].image;
                    }else{
                      throw new Error('missing logo image: ' + logoImage);
                    }
                    return ImageModel.setHubImage(hub_id, logoImage, {}, 'logo')
                    .then(function(){
                      log.info('Saved Banner Image');
                      log.info('Finished with hub: ' + hub_id);
                    });
                   });
                });
              });
              });
            });
         });
        });
    });
    commands.push(command);
});

Promise.all(commands).then(function(){
  log.info('Task Complete!');
  process.exit(0);
}).catch(function(err){
  log.error(err);
  process.exit(1);
});





