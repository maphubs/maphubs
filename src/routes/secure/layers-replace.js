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

module.exports = function(app: any) {

app.get('/layer/replace/:id/*', csrfProtection, login.ensureLoggedIn(), async (req, res, next) => {

    var user_id = req.session.user.maphubsUser.id;
    var layer_id = parseInt(req.params.id || '', 10);

    //confirm that this user is allowed to administer this layeradmin
    try{
     const allowed = await Layer.allowedToModify(layer_id, user_id);
     if(allowed){
      let layer = await Layer.getLayerByID(layer_id);
      res.render('layerreplace', {
        title: Locales.getLocaleStringObject(req.locale, layer.name) + ' - ' + MAPHUBS_CONFIG.productName,
        props: {layer}, req});
     }else{
      return res.redirect('/unauthorized');
    }
    }catch(err){
      nextError(next)(err);
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