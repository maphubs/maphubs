var Layer = require('../models/layer');

module.exports = function(layer_id, req){
   var user_id = -1;
    if(req.isAuthenticated && req.isAuthenticated() && req.session.user){
      user_id = req.session.user.id;
    }

    Layer.isPrivate(layer_id)
      .then(function(isPrivate){
        if(isPrivate){
          return Layer.allowedToModify(layer_id, user_id);  
        }else{
          return true;
        }
      });
};