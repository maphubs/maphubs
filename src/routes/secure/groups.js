// @flow
var Promise = require('bluebird');
var Group = require('../../models/group');
var User = require('../../models/user');
var Layer = require('../../models/layer');
var Image = require('../../models/image');
var Email = require('../../services/email-util');
var login = require('connect-ensure-login');
//var log = require('../../services/log');
var debug = require('../../services/debug')('routes/groups');
var apiError = require('../../services/error-response').apiError;
var nextError = require('../../services/error-response').nextError;
var apiDataError = require('../../services/error-response').apiDataError;

var local = require('../../local');

var csrfProtection = require('csurf')({cookie: false});

module.exports = function(app: any) {


  //Views
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
        Group.getGroupMembers(group_id),
        Group.allowedToModify(group_id, user_id)
      ])
      .then(function(result: Array<any>) {
        var group: Object = result[0];
        var layers = result[1];
        var members = result[2];
        var canEdit = result[3];
        res.render('groupinfo', {
          title: group.name + ' - ' + MAPHUBS_CONFIG.productName,
          props: {
            group, layers, members, canEdit
          }, req
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

  //API Endpoints
  app.post('/api/group/checkidavailable', login.ensureLoggedIn(), function(req, res) {
    var data = req.body;
    if (data && data.id) {
      Group.checkGroupIdAvailable(data.id)
        .then(function(result) {
          res.send({
            available: result
          });
        }).catch(apiError(res, 500));
    } else {
      apiDataError(res);
    }
  });

  app.get('/api/groups/search/suggestions', function(req, res) {
    if (!req.query.q) {
      apiDataError(res);
    }
    var q = req.query.q;
    Group.getSearchSuggestions(q)
      .then(function(result) {
        var suggestions = [];
        result.forEach(function(group) {
          suggestions.push({key: group.group_id, value:group.name});
        });
        res.send({
          suggestions
        });
      }).catch(apiError(res, 500));
  });

  app.get('/api/groups/search', function(req, res) {
    if (!req.query.q) {
      apiDataError(res);
    }
    Group.getSearchResults(req.query.q)
      .then(function(result){
        res.status(200).send({groups: result});
      }).catch(apiError(res, 500));
  });

  app.post('/api/group/create', function(req, res) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    var user_id = req.session.user.id;
    var data = req.body;
    if (data && data.group_id) {
      Group.createGroup(data.group_id, data.name, data.description, data.location, data.published, user_id)
        .then(function(result) {
          if (result) {
            res.send({
              success: true
            });
          } else {
            res.send({
              success: false,
              error: "Failed to Create Group"
            });
          }
        }).catch(apiError(res, 500));
    } else {
      apiDataError(res);
    }
  });

  app.post('/api/group/save', function(req, res) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    var user_id = req.session.user.id;
    var data = req.body;
    if (data && data.group_id) {
      Group.allowedToModify(data.group_id, user_id)
      .then(function(allowed){
        if(allowed){
          Group.updateGroup(data.group_id, data.name, data.description, data.location, data.published)
            .then(function(result) {
              if (result && result == 1) {
                res.send({
                  success: true
                });
              } else {
                res.send({
                  success: false,
                  error: "Failed to Save Group"
                });
              }
            }).catch(apiError(res, 500));
        }else{
          res.status(401).send();
        }
      });
    } else {
      apiDataError(res);
    }
  });

  app.post('/api/group/delete', function(req, res) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    var user_id = req.session.user.id;
    var data = req.body;
    if (data && data.group_id) {
      //TODO: should be admin, not just a member
      Group.allowedToModify(data.group_id, user_id)
      .then(function(allowed){
        if(allowed){
          Layer.getGroupLayers(data.group_id, true)
          .then(function(layers){
            if(layers && layers.length > 0){
              res.status(200).send({
                success: false,
                error: "Group has layers: You must first delete all the layers in this group"
              });
            }else{
              Group.deleteGroup(data.group_id)
                .then(function(result) {
                  if (result) {
                    res.status(200).send({
                      success: true
                    });
                  } else {
                    res.status(200).send({
                      success: false,
                      error: "Failed to Delete Group"
                    });
                  }
                }).catch(apiError(res, 500));
            }
          }).catch(apiError(res, 500));

          }else{
            res.status(401).send();
          }
      });
    } else {
      apiDataError(res);
    }
  });


  app.post('/api/group/setphoto', function(req, res) {

    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }

    var user_id = req.session.user.id;
    var data = req.body;

    if(data && data.group_id && data.image){
      Group.allowedToModify(data.group_id, user_id)
      .then(function(allowed){
        if(allowed){
          Image.setGroupImage(data.group_id, data.image, data.info)
          .then(function(){
            res.status(200).send({success: true});
          }).catch(apiError(res, 500));
        } else {
          res.status(401).send();
        }

      }).catch(apiError(res, 500));
    } else {
      apiDataError(res);
    }

  });

  app.get('/api/group/:id/members', function(req, res) {
    var group_id = req.params.id;
    Group.getGroupMembers(group_id)
    .then(function(members){
      res.status(200).send({success: true, members});
    }).catch(apiError(res, 500));
});

  app.post('/api/group/addmember', function(req, res) {

    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }

    var session_user_id = req.session.user.id;
    var data = req.body;

    if(data && data.group_id && data.display_name && data.asAdmin !== undefined){
      User.getUserByName(data.display_name)
      .then(function(user){
        if(user){
          return Group.allowedToModify(data.group_id, session_user_id)
          .then(function(allowed){
            if(allowed){
              var role = 'Member';
              if(data.asAdmin){
                role = 'Administrator';
              }
              return Group.getGroupMembers(data.group_id)
              .then(function(members){
                var alreadyInGroup = false;
                members.forEach(function(member){
                  if(member.id == user.id){
                      alreadyInGroup = true;
                  }
                });
                if(!alreadyInGroup){
                  return Group.addGroupMember(data.group_id, user.id, role)
                  .then(function(){
                    debug('Added ' + data.display_name + ' to ' + data.group_id);
                    Email.send({
                      from: MAPHUBS_CONFIG.productName + ' <info@maphub.com>',
                      to: user.email,
                      subject: req.__('Welcome to Group:') + ' ' + data.group_id + ' - ' + MAPHUBS_CONFIG.productName,
                      text: user.display_name + ',\n' +
                        req.__('You have been added to the group') + ' ' + data.group_id
                      ,
                      html: user.display_name + ',<br />' +
                        req.__('You have been added to the group') + ' ' + data.group_id
                      });
                    res.status(200).send({success: true});
                  });
                }else{
                  res.status(200).send({success: false, "error": req.__('User is already a member of this group.')});
                  return;
                }
              });
            } else {
              res.status(401).send();
            }
          });
      }else{
        res.status(200).send({
          success: false,
          error: 'User not found'
        });
        return;
      }
      }).catch(apiError(res, 500));
    } else {
      apiDataError(res);
      return;
    }

  });

  app.post('/api/group/updatememberrole', function(req, res) {

    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }

    var session_user_id = req.session.user.id;
    var data = req.body;

    if(data && data.group_id && data.user_id && data.role){
      User.getUser(data.user_id)
      .then(function(user){
        Group.allowedToModify(data.group_id, session_user_id)
        .then(function(allowed){
          if(allowed){
            Group.updateGroupMemberRole(data.group_id, user.id, data.role)
            .then(function(){
              debug('Added role' + data.role + ' to ' + data.display_name + ' of ' + data.group_id);
              res.status(200).send({success: true});
            });
          } else {
            res.status(401).send();
          }
        }).catch(apiError(res, 500));
      }).catch(apiError(res, 500));
    } else {
      apiDataError(res);
    }

  });

    app.post('/api/group/removemember', function(req, res) {

      if (!req.isAuthenticated || !req.isAuthenticated()) {
        res.status(401).send("Unauthorized, user not logged in");
        return;
      }

      var session_user_id = req.session.user.id;
      var data = req.body;

      if(data && data.group_id && data.user_id){
        User.getUser(data.user_id)
        .then(function(user){
          Group.allowedToModify(data.group_id, session_user_id)
          .then(function(allowed){
            if(allowed){
              //don't allow removal of last admin
              Group.getGroupMembersByRole(data.group_id, 'Administrator')
              .then(function(result){
                if(result && result.length == 1 && result[0].user_id == session_user_id){
                  //last admin
                  debug('Attempted to delete last admin ' + data.display_name + ' from ' + data.group_id);
                  throw new Error('Unable to delete only administrator from the group. Please assign another admin first.');
                }else{
                  return Group.removeGroupMember(data.group_id, user.id)
                  .then(function(){
                    debug('Removed ' + data.display_name + ' from ' + data.group_id);
                    Email.send({
                      from: MAPHUBS_CONFIG.productName + ' <' + local.fromEmail + '>',
                      to: user.email,
                      subject: req.__('Removed from Group:') + ' ' + data.group_id + ' - ' + MAPHUBS_CONFIG.productName,
                      text: user.display_name + ',\n' +
                        req.__('You have been removed from the group') + ' ' + data.group_id + '\n'
                      ,
                      html: user.display_name + ',' +
                        '<br />' + req.__('You have been removed from the group') + ' ' + data.group_id + '\n'
                      });
                    res.status(200).send({success: true});
                  });
                }
              }).catch(apiError(res, 500));

              } else {
                res.status(401).send();
              }
          }).catch(apiError(res, 500));
      }).catch(apiError(res, 500));
      } else {
        apiDataError(res);
      }

  });



};
