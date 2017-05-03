// @flow
var Layer = require('../../models/layer');
var Group = require('../../models/group');
var User = require('../../models/user');
var Stats = require('../../models/stats');
//var log = require('../../services/log');
var Promise = require('bluebird');
var login = require('connect-ensure-login');
//var debug = require('../../services/debug')('routes/layers');
var urlUtil = require('../../services/url-util');
var nextError = require('../../services/error-response').nextError;
var csrfProtection = require('csurf')({cookie: false});
var privateLayerCheck = require('../../services/private-layer-check').middlewareView;

module.exports = function(app: any) {

  //Views
  app.get('/layers', csrfProtection, (req, res, next) => {
    Promise.all([     
      Layer.getFeaturedLayers(),
      Layer.getRecentLayers(),
      Layer.getPopularLayers()
    ])
      .then((results) => {
        var featuredLayers = results[0];
        var recentLayers = results[1];
        var popularLayers = results[2];
        res.render('layers', {
          title: req.__('Layers') + ' - ' + MAPHUBS_CONFIG.productName,
          props: {featuredLayers, recentLayers, popularLayers},
          req
        });
      }).catch(nextError(next));
  });

  app.get('/createlayer', csrfProtection, login.ensureLoggedIn(), (req, res, next) => {

    var user_id = req.session.user.id;
    Layer.createLayer(user_id).then(layer_id =>{
      layer_id = parseInt(layer_id);
      return Layer.getLayerByID(layer_id).then(layer =>{
        return Group.getGroupsForUser(user_id)
        .then((result) => {
          res.render('createlayer', {
            title: req.__('Create Layer') + ' - ' + MAPHUBS_CONFIG.productName,
            props: {groups: result, layer},
            req
          });
        });
      });
    }).catch(nextError(next));

  });

  app.get('/layer/info/:layer_id/*', privateLayerCheck, csrfProtection, (req, res, next) => {

    var layer_id = parseInt(req.params.layer_id || '', 10);
    var baseUrl = urlUtil.getBaseUrl();

    var user_id = -1;
    if(req.isAuthenticated && req.isAuthenticated() && req.session.user){
      user_id = req.session.user.id;
    }

    if(!req.session.layerviews){
      req.session.layerviews = {};
    }
    if(!req.session.layerviews[layer_id]){
      req.session.layerviews[layer_id] = 1;
      Stats.addLayerView(layer_id,user_id).catch(nextError(next));
    }else{
      var views = req.session.layerviews[layer_id];

      req.session.layerviews[layer_id] = views + 1;
    }

    req.session.views = (req.session.views || 0) + 1;
      Promise.all([
        Layer.getLayerByID(layer_id),
        Stats.getLayerStats(layer_id),
        Layer.allowedToModify(layer_id, user_id),
        Layer.getLayerNotes(layer_id)
      ])
      .then((results: Array<any>) => {
        var layer: Object = results[0];
        var stats = results[1];
        var canEdit: boolean = results[2];
        var notesObj = results[3];

        return Promise.all([
          User.getUser(layer.created_by_user_id),
          User.getUser(layer.updated_by_user_id)
        ])
        .then((userResults: Array<any>) => {
          var createdByUser = userResults[0];
          var updatedByUser = userResults[1];
          var notes = null;
          if(notesObj && notesObj.notes){
            notes = notesObj.notes;
          }
          if(layer){
          res.render('layerinfo', {title: layer.name + ' - ' + MAPHUBS_CONFIG.productName,
          description: layer.description,
          props: {layer, notes, stats, canEdit, createdByUser, updatedByUser},
          fontawesome: true, addthis: true,
          twitterCard: {
            title: layer.name,
            description: layer.description,
            image: baseUrl + '/api/screenshot/layer/image/' + layer.layer_id + '.png',
            imageWidth: 1200,
            imageHeight: 630,
            imageType: 'image/png'
          },
          req});
        }else{
          res.render('error', {
            title: req.__('Not Found'),
            props: {
              title: req.__('Not Found'),
              error: req.__('The page you request was not found'),
              url: req.url
            },
            req
          });
        }
      });
      }).catch(nextError(next));
  });

  app.get('/lyr/:layerid', csrfProtection, (req, res) => {
    var layerid = req.params.layerid;
    var baseUrl = urlUtil.getBaseUrl();
    res.redirect(baseUrl + '/layer/info/' + layerid + '/');
  });

  app.get('/layer/map/:layer_id/*', privateLayerCheck, csrfProtection, (req, res, next) => {

    var layer_id = parseInt(req.params.layer_id || '', 10);
    var baseUrl = urlUtil.getBaseUrl();

    var user_id = -1;
    if(req.isAuthenticated && req.isAuthenticated() && req.session.user){
      user_id = req.session.user.id;
    }

    if(!req.session.layerviews){
      req.session.layerviews = {};
    }
    if(!req.session.layerviews[layer_id]){
      req.session.layerviews[layer_id] = 1;
      Stats.addLayerView(layer_id,user_id).catch(nextError(next));
    }else{
      var views = req.session.layerviews[layer_id];

      req.session.layerviews[layer_id] = views + 1;
    }
     req.session.views = (req.session.views || 0) + 1;
      Promise.all([
      Layer.getLayerByID(layer_id),
      Layer.allowedToModify(layer_id, user_id)
      ])
    .then((results: Array<any>) => {
      var layer: Object = results[0];
      var canEdit: boolean = results[1];
      if(layer){
        res.render('layermap', {
          title: layer.name + ' - ' + MAPHUBS_CONFIG.productName,
          description: layer.description,
          props: {layer, canEdit}, hideFeedback: true, addthis: true,
          twitterCard: {
            title: layer.name,
            description: layer.description,
            image: baseUrl + '/api/screenshot/layer/image/' + layer.layer_id + '.png',
            imageWidth: 1200,
            imageHeight: 630,
            imageType: 'image/png'
          },
          req
        });
       }else{
          res.render('error', {
            title: req.__('Not Found'),
            props: {
              title: req.__('Not Found'),
              error: req.__('The page you request was not found'),
              url: req.url
            },
            req
          });
        }
    }).catch(nextError(next));
  });

  app.get('/layer/adddata/:id', csrfProtection, login.ensureLoggedIn(), (req, res, next) => {

    var layer_id = parseInt(req.params.id || '', 10);
    var user_id = req.session.user.id;

    Layer.allowedToModify(layer_id, user_id)
      .then((allowed) => {
          return Layer.getLayerByID(layer_id)
          .then((layer) => {
            if(allowed || layer.allowPublicSubmission){ //placeholder for public submission flag on layers
              if(layer.data_type == 'point' && !layer.is_external){
                res.render('addphotopoint', {title: layer.name + ' - ' + MAPHUBS_CONFIG.productName,
                props: {layer}, req});
              }else{
                res.status(400).send('Bad Request: Feature not support for this layer');
              }
            }else{
              res.redirect('/unauthorized');
            }
          }).catch(nextError(next));
        }).catch(nextError(next));
  });

  app.get('/layer/admin/:id/*', csrfProtection, login.ensureLoggedIn(), (req, res, next) => {

    var user_id = req.session.user.id;
    var layer_id = parseInt(req.params.id || '', 10);

    //confirm that this user is allowed to administer this layeradmin
    Layer.allowedToModify(layer_id, user_id)
      .then((allowed) => {
        if(allowed){
          return Promise.all([
          Layer.getLayerByID(layer_id),
          Group.getGroupsForUser(user_id)
        ])
        .then((results) => {
          var layer = results[0];
          var groups = results[1];
          res.render('layeradmin', {title: layer.name + ' - ' + MAPHUBS_CONFIG.productName,
          props: {layer, groups}, req});
          });
        }else{
          res.redirect('/unauthorized');
        }
      }).catch(nextError(next));
  });

};
