// @flow
var Promise = require('bluebird');
var Group = require('../../models/group');
var User = require('../../models/user');
var Layer = require('../../models/layer');
var Hub = require('../../models/hub');
var Map = require('../../models/map');
var Account = require('../../models/account');
var login = require('connect-ensure-login');
//var log = require('../../services/log');
var debug = require('../../services/debug')('routes/groups');
var nextError = require('../../services/error-response').nextError;
var urlUtil = require('../../services/url-util');
var Locales = require('../../services/locales');

var csrfProtection = require('csurf')({cookie: false});

module.exports = function(app: any) {

  app.get('/groups', csrfProtection, (req, res, next) => {
    Promise.all([
      Group.getFeaturedGroups(),
      Group.getRecentGroups(),
      Group.getPopularGroups()
    ])
      .then((results) => {
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

  app.get('/creategroup', csrfProtection, login.ensureLoggedIn(), (req, res) => {
    res.render('creategroup', {
      title: req.__('Create Group') + ' - ' + MAPHUBS_CONFIG.productName,
      props: {}, req
    });
  });

  app.get('/group/:id', csrfProtection, (req, res, next) => {

    var group_id = req.params.id;

    var user_id = -1;
    if(req.isAuthenticated && req.isAuthenticated() && req.session.user){
      user_id = req.session.user.maphubsUser.id;
    }
    Group.allowedToModify(group_id, user_id)
    .then((canEdit) => {
      return Promise.all([
          Group.getGroupByID(group_id),
          Map.getGroupMaps(group_id, canEdit),
          Layer.getGroupLayers(group_id, canEdit),
          Hub.getGroupHubs(group_id, canEdit),
          Group.getGroupMembers(group_id),
        ])
      .then((result: Array<any>) => {
        var group: Object = result[0];
        var maps = result[1];
        var layers = result[2];
        var hubs = result[3];
        var members = result[4];
        var image = urlUtil.getBaseUrl() +  '/group/OpenStreetMap/image';
        let name = Locales.getLocaleStringObject(req.locale, group.name);
        let description = Locales.getLocaleStringObject(req.locale, group.description);
        res.render('groupinfo', {
          title: name + ' - ' + MAPHUBS_CONFIG.productName,
          description,
          props: {
            group, maps, layers, hubs, members, canEdit
          },
           twitterCard: {
            card: 'summary',
            title: name,
            description,
            image,
            imageType: 'image/png',
            imageWidth: 600,
            imageHeight: 600
          },
           req
        });
        });
      }).catch(nextError(next));
  });

  app.get('/group/:id/admin', csrfProtection, login.ensureLoggedIn(), (req, res, next) => {

    var user_id = parseInt(req.session.user.maphubsUser.id);
    var group_id = req.params.id;

    //confirm that this user is allowed to administer this group
    Group.getGroupRole(user_id, group_id)
      .then((role) => {
        if (role === 'Administrator') {
          Promise.all([
              Group.getGroupByID(group_id),
              Map.getGroupMaps(group_id, true),
              Layer.getGroupLayers(group_id, true),
              Hub.getGroupHubs(group_id, true),
              Group.getGroupMembers(group_id),
              Account.getStatus(group_id)
            ])
            .then((result: Array<any>) => {
              var group: Object = result[0];
              var maps: Array<Object> = result[1];
              var layers: Array<Object> = result[2];
              var hubs: Array<Object> = result[3];
              var members: Array<Object> = result[4];
              var account: Object = result[5];
              let name = Locales.getLocaleStringObject(req.locale, group.name);
              res.render('groupadmin', {
                title: name + ' ' + req.__('Settings') + ' - ' + MAPHUBS_CONFIG.productName,
                props: {
                  group, maps, layers, hubs, members, account
                }, req
              });
            }).catch(nextError(next));
        } else {
          res.redirect('/unauthorized');
        }
      }).catch(nextError(next));
  });

  app.get('/user/:username/groups', csrfProtection, (req, res, next) => {

    var username = req.params.username;
    debug(username);
    if(!username){nextError(next);}
    var canEdit = false;

    function completeRequest(userCanEdit){
      User.getUserByName(username)
      .then((user) => {       
        if(user){
          return Group.getGroupsForUser(user.id)
          .then((groups) => {
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
      var user_id = req.session.user.maphubsUser.id;

      //get user for logged in user
      User.getUser(user_id)
      .then((user) => {
        //flag if requested user is logged in user
        if(user.display_name === username){
          canEdit = true;
        }
        completeRequest(canEdit);
      }).catch(nextError(next));
    }
  });

};
