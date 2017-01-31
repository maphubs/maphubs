var csrfProtection = require('csurf')({cookie: false});
var login = require('connect-ensure-login');

module.exports = function(app) {

  app.get('/page/edit/:id/*', csrfProtection, login.ensureLoggedIn(), function(req, res, next) {

    var user_id = req.session.user.id;
    var layer_id = parseInt(req.params.id || '', 10);

    //confirm user 

    if(user_id === 1){
      Page.getPage()
    }else{
      res.redirect('/unauthorized');
    }

    Layer.allowedToModify(layer_id, user_id)
      .then(function(allowed){
        if(allowed){
          return Promise.all([
          Layer.getLayerByID(layer_id),
          Group.getGroupsForUser(user_id)
        ])
        .then(function(results){
          var layer = results[0];
          var groups = results[1];
          res.render('pageedit', {title: req.__('Edit Page') + ' - ' + MAPHUBS_CONFIG.productName,
          props: {page}, req});
          });
        }else{
          res.redirect('/unauthorized');
        }
      }).catch(nextError(next));
  });

};
