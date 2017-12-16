// @flow
const Hub = require('../../models/hub');
const Image = require('../../models/image');
const apiError = require('../../services/error-response').apiError;
const apiDataError = require('../../services/error-response').apiDataError;
const notAllowedError = require('../../services/error-response').notAllowedError;
const isAuthenticated = require('../../services/auth-check');

const csrfProtection = require('csurf')({cookie: false});

module.exports = function(app: any) {

  app.post('/api/hub/checkidavailable', csrfProtection, isAuthenticated, async (req, res) => {
    try{
      if(req.body && req.body.id) {
        res.send({
          available: await Hub.checkHubIdAvailable(req.body.id)
        });
      }else{
        res.status(400).send('Bad Request: required data not found');
      }
    }catch(err){apiError(res, 500)(err);}
  });

  app.get('/api/hubs/search/suggestions', async (req, res) => {
    try{
      if (!req.query.q) {
        res.status(400).send('Bad Request: Expected query param. Ex. q=abc');
      }else{
        const result = await Hub.getSearchSuggestions(req.query.q);
        const suggestions = result.map((hub) => {
          return {key: hub.hub_id, value:hub.name};
        });
        return res.send({
          suggestions
        });
      }
    }catch(err){apiError(res, 500)(err);}
  });

  app.get('/api/hubs/search', async (req, res) => {
    try{
      if(!req.query.q) {
        res.status(400).send('Bad Request: Expected query param. Ex. q=abc');
      }else{
        res.status(200).send({
          hubs: await Hub.getSearchResults(req.query.q)
        });
      }
    }catch(err){apiError(res, 500)(err);}
  });

  app.post('/api/hub/create', csrfProtection, isAuthenticated, (req, res) => {
    const data = req.body;
    if(data && data.hub_id && data.group_id && data.name) {
      Hub.createHub(data.hub_id, data.group_id, data.name, data.published, data.private, req.user_id)
        .then((result) => {
          if (result) {
            return res.send({
              success: true
            });
          } else {
            return res.send({
              success: false,
              error: "Failed to Create Hub"
            });
          }
        }).catch(apiError(res, 500));
    } else {
      res.status(400).send({
        success: false,
        error: 'Bad Request: required data not found'
      });
    }
  });

  app.post('/hub/:hubid/api/save', csrfProtection, isAuthenticated, async(req, res) => {
    try{
      const data = req.body;
      if (data && data.hub_id) {
        //TODO: wrap in transaction
        if(await Hub.allowedToModify(data.hub_id, req.user_id)){
          if(data.name) data.name = data.name.replace('&nbsp;', '');
          if(data.tagline) data.tagline = data.tagline.replace('&nbsp;', '');
          if(data.description) data.description = data.description.replace('&nbsp;', '');

          const result = await Hub.updateHub(data.hub_id, data.name, data.description, data.tagline, data.published, data.resources, data.about, data.map_id, req.user_id);
          if(result && result === 1) {
            if(data.logoImage){
              await Image.setHubImage(data.hub_id, data.logoImage, data.logoImageInfo, 'logo');
            }
            if(data.bannerImage){
              await Image.setHubImage(data.hub_id, data.bannerImage, data.bannerImageInfo, 'banner');
            }
            return res.send({success: true});
          } else {
            return res.send({
              success: false,
              error: "Failed to Save Hub"
            });
          }
        }else{
          return notAllowedError(res, 'hub');
        }
      } else {
        apiDataError(res);
      }
    }catch(err){apiError(res, 500)(err);}
  });

  /**
   * change hub privacy settings
   */
  app.post('/hub/:hubid/api/privacy', csrfProtection, isAuthenticated, async (req, res) => {
    try{
      const data = req.body;
      if(data && data.hub_id && data.isPrivate){
        if(await Hub.allowedToModify(data.hub_id, req.user_id)){
          await Hub.setPrivate(data.hub_id, data.isPrivate, data.user_id);
          return res.status(200).send({success: true});
        }else{
          return notAllowedError(res, 'hub');
        }
      }else{
        apiDataError(res);
      }
    }catch(err){apiError(res, 500)(err);}
  });

/* Not Used?
    app.get('/hub/:hubid/api/layers', function(req, res) {
      var hub_id = req.params.hubid;
      Layer.getHubLayers(hub_id, false)
      .then(function(layers){
        res.status(200).send({success: true, layers});
      }).catch(apiError(res, 500));
  });
  */

  app.post('/hub/:hubid/api/delete', csrfProtection, isAuthenticated, async (req, res) => {
    try{
      const data = req.body;
      if(data && data.hub_id) {
        if(await Hub.allowedToModify(data.hub_id, req.user_id)){
          await Hub.deleteHub(data.hub_id);
          return res.send({success: true});
        }else{
          return res.status(401).send();
        }
      } else {
        apiDataError(res);
      }
    }catch(err){apiError(res, 500)(err);}
  });
};