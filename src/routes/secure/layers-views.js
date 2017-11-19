// @flow
var Layer = require('../../models/layer');
var Group = require('../../models/group');
var User = require('../../models/user');
var Stats = require('../../models/stats');
//var log = require('../../services/log');
var login = require('connect-ensure-login');
//var debug = require('../../services/debug')('routes/layers');
var urlUtil = require('../../services/url-util');
var nextError = require('../../services/error-response').nextError;
var csrfProtection = require('csurf')({cookie: false});
var privateLayerCheck = require('../../services/private-layer-check').middlewareView;
var Locales = require('../../services/locales');
var knex = require('../../connection.js');

module.exports = function(app: any) {

  //Views
  app.get('/layers', csrfProtection, async (req, res, next) => {
    try {
      return res.render('layers', {
        title: req.__('Layers') + ' - ' + MAPHUBS_CONFIG.productName,
        props: {
          featuredLayers: await Layer.getFeaturedLayers(), 
          recentLayers: await Layer.getRecentLayers(), 
          popularLayers: await Layer.getPopularLayers()
        },
        req
      });
    }catch(err){nextError(next)(err);}
  });

  app.get('/layers/all', csrfProtection, async (req, res, next) => {   
    try{
      return res.render('alllayers', {
        title: req.__('Layers') + ' - ' + MAPHUBS_CONFIG.productName,
        props: {
          layers:  await Layer.getAllLayers(false)
        },
        req
      });
    }catch(err){nextError(next)(err);}
  });

  app.get('/createlayer', csrfProtection, login.ensureLoggedIn(), (req, res, next) => {   
    const user_id = req.session.user.maphubsUser.id;
    knex.transaction( async (trx) => {
      let layer_id = await Layer.createLayer(user_id, trx);
      layer_id = parseInt(layer_id);

      return res.render('createlayer', {
        title: req.__('Create Layer') + ' - ' + MAPHUBS_CONFIG.productName,
        props: {
          groups: await Group.getGroupsForUser(user_id, trx), 
          layer: await Layer.getLayerByID(layer_id, trx)
        },
        req
      });
    }).catch(nextError(next));
  });

  app.get('/layer/info/:layer_id/*', privateLayerCheck, csrfProtection, async (req, res, next) => {
    try {
      const layer_id = parseInt(req.params.layer_id || '', 10);
      const baseUrl = urlUtil.getBaseUrl();

      let user_id = -1;
      if(req.isAuthenticated && req.isAuthenticated() && req.session.user){
        user_id = req.session.user.maphubsUser.id;
      }

      if(!req.session.layerviews){
        req.session.layerviews = {};
      }
      if(!req.session.layerviews[layer_id]){
        req.session.layerviews[layer_id] = 1;
        await Stats.addLayerView(layer_id,user_id).catch(nextError(next));
      }else{
        let views = req.session.layerviews[layer_id];
        req.session.layerviews[layer_id] = views + 1;
      }

      req.session.views = (req.session.views || 0) + 1;

      const layer = await Layer.getLayerByID(layer_id);
      if(layer){
        const name = Locales.getLocaleStringObject(req.locale, layer.name);
        const description = Locales.getLocaleStringObject(req.locale, layer.description);
        const notesObj = await Layer.getLayerNotes(layer_id);  
        let notes;
        if(notesObj && notesObj.notes){
          notes = notesObj.notes;
        }
        return res.render('layerinfo', {
          title: name + ' - ' + MAPHUBS_CONFIG.productName,
          description,
          props: {
            layer, 
            notes, 
            stats: await Stats.getLayerStats(layer_id), 
            canEdit: await Layer.allowedToModify(layer_id, user_id), 
            createdByUser: await User.getUser(layer.created_by_user_id), 
            updatedByUser: await User.getUser(layer.updated_by_user_id)
          },
          talkComments: true,
          fontawesome: true, hideFeedback: true,
          twitterCard: {
            title: name,
            description,
            image: baseUrl + '/api/screenshot/layer/image/' + layer.layer_id + '.png',
            imageWidth: 1200,
            imageHeight: 630,
            imageType: 'image/png'
          },
        req});
      }else{
        return res.render('error', {
          title: req.__('Not Found'),
          props: {
            title: req.__('Not Found'),
            error: req.__('The page you request was not found'),
            url: req.url
          },
          req
        });
      }
    }catch(err){nextError(next)(err);}
  });

  app.get('/lyr/:layerid', csrfProtection, (req, res) => {
    var layerid = req.params.layerid;
    var baseUrl = urlUtil.getBaseUrl();
    res.redirect(baseUrl + '/layer/info/' + layerid + '/');
  });

  app.get('/layer/map/:layer_id/*', privateLayerCheck, csrfProtection, async(req, res, next) => {
    try{
    const layer_id = parseInt(req.params.layer_id || '', 10);
    const baseUrl = urlUtil.getBaseUrl();

    let user_id = -1;
    if(req.isAuthenticated && req.isAuthenticated() && req.session.user){
      user_id = req.session.user.maphubsUser.id;
    }

    if(!req.session.layerviews){
      req.session.layerviews = {};
    }
    if(!req.session.layerviews[layer_id]){
      req.session.layerviews[layer_id] = 1;
      await Stats.addLayerView(layer_id,user_id);
    }else{
      let views = req.session.layerviews[layer_id];
      req.session.layerviews[layer_id] = views + 1;
    }
    req.session.views = (req.session.views || 0) + 1;

    const layer = await Layer.getLayerByID(layer_id);     
    if(layer){
      let name = Locales.getLocaleStringObject(req.locale, layer.name);
      let description = Locales.getLocaleStringObject(req.locale, layer.description);
      return res.render('layermap', {
        title: name + ' - ' + MAPHUBS_CONFIG.productName,
        description,
        props: {
          layer, 
          canEdit: await Layer.allowedToModify(layer_id, user_id)
        }, hideFeedback: true,
        twitterCard: {
          title: name,
          description,
          image: baseUrl + '/api/screenshot/layer/image/' + layer.layer_id + '.png',
          imageWidth: 1200,
          imageHeight: 630,
          imageType: 'image/png'
        },
        req
      });
      }else{
        return res.render('error', {
          title: req.__('Not Found'),
          props: {
            title: req.__('Not Found'),
            error: req.__('The page you request was not found'),
            url: req.url
          },
          req
        });
      }
    }catch(err){nextError(next)(err);}
  });

  app.get('/layer/adddata/:id', csrfProtection, login.ensureLoggedIn(), async (req, res, next) => {
    try{
      const layer_id = parseInt(req.params.id || '', 10);
      const user_id = req.session.user.maphubsUser.id;
      const allowed = await Layer.allowedToModify(layer_id, user_id);
      const layer = await Layer.getLayerByID(layer_id);
      if(allowed || layer.allowPublicSubmission){ //placeholder for public submission flag on layers
        if(layer.data_type === 'point' && !layer.is_external){
          return res.render('addphotopoint', {title: Locales.getLocaleStringObject(req.locale, layer.name) + ' - ' + MAPHUBS_CONFIG.productName,
          props: {layer}, req});
        }else{
          return res.status(400).send('Bad Request: Feature not support for this layer');
        }
      }else{
        return res.redirect('/unauthorized');
      }
    }catch(err){nextError(next)(err);}
  });

  app.get('/layer/admin/:id/*', csrfProtection, login.ensureLoggedIn(), async(req, res, next) => {
    try{
    const user_id = req.session.user.maphubsUser.id;
    const layer_id = parseInt(req.params.id || '', 10);

    //confirm that this user is allowed to administer this layeradmin
    const allowed = await Layer.allowedToModify(layer_id, user_id);

    if(allowed){
      const layer = await Layer.getLayerByID(layer_id);
      return res.render('layeradmin', {title: Locales.getLocaleStringObject(req.locale, layer.name) + ' - ' + MAPHUBS_CONFIG.productName,
      props: {
        layer, 
        groups: await Group.getGroupsForUser(user_id)
      }, req});
    }else{
      return res.redirect('/unauthorized');
    }
    }catch(err){nextError(next)(err);}
  });
};