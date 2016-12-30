// @flow
var Promise = require('bluebird');
var Group = require('../../models/group');
var User = require('../../models/user');
var Layer = require('../../models/layer');
var Hub = require('../../models/hub');
var login = require('connect-ensure-login');
//var log = require('../../services/log');
var debug = require('../../services/debug')('routes/groups');
var nextError = require('../../services/error-response').nextError;
var urlUtil = require('../../services/url-util');

var csrfProtection = require('csurf')({cookie: false});

module.exports = function(app: any) {

  app.get('/groups', csrfProtection, function(req, res, next) {
    Promise.all([
      Group.getFeaturedGroups(),
      Group.getRecentGroups(),
      Group.getPopularGroups()
    ])
      .then(function(results) {
        var featuredGroups = results[0];
        var recentGroups = results[1];
        var popularGroups = results[2];
        res.render('groups', {
          title: req.__('Groups') + ' - ' + MAPHUBS_CONFIG.productName,
          props: {
            featuredGroups, recentGroups, popularGroups
          }, req
        });
      }).catch(nextError(next));
  });

  app.get('/creategroup', csrfProtection, login.ensureLoggedIn(), function(req, res) {
    res.render('creategroup', {
      title: req.__('Create Group') + ' - ' + MAPHUBS_CONFIG.productName,
      props: {}, req
    });
  });

  app.get('/group/:id', csrfProtection, function(req, res, next) {

    var group_id = req.params.id;

    var user_id = -1;
    if(req.isAuthenticated && req.isAuthenticated() && req.session.user){
      user_id = req.session.user.id;
    }

    Promise.all([
        Group.getGroupByID(group_id),
        Layer.getGroupLayers(group_id),
        Hub.getGroupHubs(group_id),
        Group.getGroupMembers(group_id),
        Group.allowedToModify(group_id, user_id)
      ])
      .then(function(result: Array<any>) {
        var group: Object = result[0];
        var layers = result[1];
        var hubs = result[2];
        var members = result[3];
        var canEdit = result[4];
        var image = urlUtil.getBaseUrl() +  '/group/OpenStreetMap/image';
        res.render('groupinfo', {
          title: group.name + ' - ' + MAPHUBS_CONFIG.productName,
          description: group.description,
          props: {
            group, layers, hubs, members, canEdit
          },
           twitterCard: {
            card: 'summary',
            title: group.name,
            description: group.description,
            image,
            imageType: 'image/png',
            imageWidth: 600,
            imageHeight: 600
          },
           req
        });
      }).catch(nextError(next));
  });

  app.get('/group/:id/admin', csrfProtection, login.ensureLoggedIn(), function(req, res, next) {

    var user_id = req.session.user.id;
    var group_id = req.params.id;

    //confirm that this user is allowed to administer this group
    Group.getGroupRole(user_id, group_id)
      .then(function(result) {
        if (result && result.length == 1 && result[0].role == 'Administrator') {
          Promise.all([
              Group.getGroupByID(group_id),
              Layer.getGroupLayers(group_id, true),
              Group.getGroupMembers(group_id)
            ])
            .then(function(result) {
              var group = result[0];
              var layers = result[1];
              var members = result[2];
              res.render('groupadmin', {
                title: group.name + ' ' + req.__('Settings') + ' - ' + MAPHUBS_CONFIG.productName,
                props: {
                  group, layers, members
                }, req
              });
            }).catch(nextError(next));
        } else {
          res.redirect('/unauthorized');
        }
      }).catch(nextError(next));
  });

  app.get('/user/:username/groups', csrfProtection, function(req, res, next) {

    var username = req.params.username;
    debug(username);
    if(!username){nextError(next);}
    var canEdit = false;

    function completeRequest(userCanEdit){
      User.getUserByName(username)
      .then(function(user){
        if(user){
          return Group.getGroupsForUser(user.id)
          .then(function(groups){
            res.render('usergroups', {title: 'Groups - ' + username, props:{user, groups, canEdit: userCanEdit}, req});
          });
        }else{
          res.redirect('/notfound?path='+req.path);
        }
      }).catch(nextError(next));
    }

    if (!req.isAuthenticated || !req.isAuthenticated()
        || !req.session || !req.session.user) {
          completeRequest();
    } else {
      //get user id
      var user_id = req.session.user.id;

      //get user for logged in user
      User.getUser(user_id)
      .then(function(user){
        //flag if requested user is logged in user
        if(user.display_name === username){
          canEdit = true;
        }
        completeRequest(canEdit);
      }).catch(nextError(next));
    }
  });

};
