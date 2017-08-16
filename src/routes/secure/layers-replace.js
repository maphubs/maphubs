//@flow
var Layer = require('../../models/layer');
var csrfProtection = require('csurf')({cookie: false});
var nextError = require('../../services/error-response').nextError;
var login = require('connect-ensure-login');
var Locales = require('../../services/locales');

module.exports = function(app: any) {

app.get('/layer/replace/:id/*', csrfProtection, login.ensureLoggedIn(), (req, res, next) => {

    var user_id = req.session.user.maphubsUser.id;
    var layer_id = parseInt(req.params.id || '', 10);

    //confirm that this user is allowed to administer this layeradmin
    Layer.allowedToModify(layer_id, user_id)
      .then((allowed) => {
        if(allowed){
          return Promise.all([
          Layer.getLayerByID(layer_id)
        ])
        .then((results) => {
          var layer = results[0];
          return res.render('layerreplace', {
            title: Locales.getLocaleStringObject(req.locale, layer.name) + ' - ' + MAPHUBS_CONFIG.productName,
            props: {layer}, req});
          });
        }else{
          return res.redirect('/unauthorized');
        }
      }).catch(nextError(next));
  });

}