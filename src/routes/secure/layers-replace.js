//@flow
var Layer = require('../../models/layer');
var csrfProtection = require('csurf')({cookie: false});
var nextError = require('../../services/error-response').nextError;
var login = require('connect-ensure-login');
var Locales = require('../../services/locales');
var apiError = require('../../services/error-response').apiError;
var apiDataError = require('../../services/error-response').apiDataError;
var notAllowedError = require('../../services/error-response').notAllowedError;
var DataLoadUtils = require('../../services/data-load-utils');
var knex = require('../../connection');
var multer  = require('multer');
var local = require('../../local');
var log = require('../../services/log');
var debug = require('../../services/debug')('routes/layers-replace');
const Importers = require('../../services/importers');

module.exports = function(app: any) {

app.get('/layer/replace/:id/*', csrfProtection, login.ensureLoggedIn(), async (req, res, next) => {

    var user_id = req.session.user.maphubsUser.id;
    var layer_id = parseInt(req.params.id || '', 10);

    //confirm that this user is allowed to administer this layeradmin
    try{
     const allowed = await Layer.allowedToModify(layer_id, user_id);
     if(allowed){
      let layer = await Layer.getLayerByID(layer_id);
      if(layer){
        res.render('layerreplace', {
          title: Locales.getLocaleStringObject(req.locale, layer.name) + ' - ' + MAPHUBS_CONFIG.productName,
          props: {layer}, req});
      }else{
        nextError(next)(new Error('Layer not found'));
      }
     }else{
      return res.redirect('/unauthorized');
    }
    }catch(err){
      nextError(next)(err);
    }
  });

  app.post('/api/layer/:id/upload/replace', multer({dest: local.tempFilePath + '/uploads/'}).single('file'),
  async (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()
        || !req.session || !req.session.user) {
      res.status(401).send("Unauthorized, user not logged in");
    }

    var user_id = req.session.user.maphubsUser.id;
    var layer_id = parseInt(req.params.id || '', 10);
    try {
     const layer = await Layer.getLayerByID(layer_id);
     if(layer){
       let shortid = layer.shortid;       
       if(layer.created_by_user_id === user_id){
         debug.log('Mimetype: ' +req.file.mimetype);
         const importer = Importers.getImporterFromFileName(req.file.originalname);
         const importerResult = await importer(req.file.path, layer_id);
         if(importerResult.type && importerResult.type === 'FeatureCollection'){
           //is geoJSON           
           const result = await DataLoadUtils.storeTempGeoJSON(importerResult, req.file.path, layer_id, shortid, false, false);
           return res.status(200).send(result);
         }else{
           //pass through other types of results
           return res.status(200).send(importerResult);
         }  
         }else {
           return notAllowedError(res, 'layer');
         }
     }else{
       throw new Error('layer not found');
     } 
   }catch(err){
     log.error(err.message);
     apiError(res, 200)(err);
   }
 });

  app.post('/api/layer/data/replace', csrfProtection, async (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    var user_id = req.session.user.maphubsUser.id;
    var data = req.body;
    if (data && data.layer_id) {
      try{
      const allowed =  await Layer.allowedToModify(data.layer_id, user_id);
      if(allowed){
        await knex.transaction(async (trx) => {
          await DataLoadUtils.removeLayerData(data.layer_id, trx);
          await DataLoadUtils.loadTempData(data.layer_id, trx);
          await Layer.setComplete(data.layer_id, trx);
          return res.send({success: true});
        });
      }else {
        return notAllowedError(res, 'layer');
      }
      }catch(err){
        apiError(res, 200)(err);
      }
    } else {
      apiDataError(res);
    }

  });

};