// @flow
var Group = require('../../models/group');
var User = require('../../models/user');
var Layer = require('../../models/layer');
var Image = require('../../models/image');
var Account = require('../../models/account');
var Email = require('../../services/email-util');
var login = require('connect-ensure-login');
//var log = require('../../services/log');
var debug = require('../../services/debug')('routes/groups');
var apiError = require('../../services/error-response').apiError;
var apiDataError = require('../../services/error-response').apiDataError;
var local = require('../../local');
var Locales = require('../../services/locales');

var csrfProtection = require('csurf')({cookie: false});

module.exports = function(app: any) {

  //API Endpoints
  app.post('/api/group/checkidavailable', login.ensureLoggedIn(), (req, res) => {
    var data = req.body;
    if (data && data.id) {
      Group.checkGroupIdAvailable(data.id)
        .then((result) => {
          res.send({
            available: result
          });
        }).catch(apiError(res, 200));
    } else {
      apiDataError(res);
    }
  });

  app.get('/api/groups/search/suggestions', (req, res) => {
    if (!req.query.q) {
      apiDataError(res);
    }
    var q = req.query.q;
    Group.getSearchSuggestions(q)
      .then((result) => {
        var suggestions = [];
        result.forEach((group) => {
          let name = Locales.getLocaleStringObject(req.locale, group.name);
          suggestions.push({key: group.group_id, value:name});
        });
        res.send({
          suggestions
        });
      }).catch(apiError(res, 200));
  });

  app.get('/api/groups/search', (req, res) => {
    if (!req.query.q) {
      apiDataError(res);
    }
    Group.getSearchResults(req.query.q)
      .then((result) => {
        res.status(200).send({groups: result});
      }).catch(apiError(res, 200));
  });

  app.post('/api/group/create', csrfProtection, (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    var user_id = req.session.user.maphubsUser.id;
    var data = req.body;
    if (data && data.group_id) {
      Group.createGroup(data.group_id, data.name, data.description, data.location, data.published, user_id)
        .then((result) => {
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
        }).catch(apiError(res, 200));
    } else {
      apiDataError(res);
    }
  });

  app.post('/api/group/account/status', csrfProtection, (req, res) => {
     if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    var user_id = req.session.user.maphubsUser.id;
    var data = req.body;
    if (data && data.group_id) {
      Group.allowedToModify(data.group_id, user_id)
      .then((allowed) => {
        if(allowed){
          return Account.getStatus(data.group_id)
          .then((status) => {
             res.status(200).send({status});
          });
        }else{
        res.status(401).send();
        }
      });
    } else {
      apiDataError(res);
    }
          
  });

  app.post('/api/group/save', csrfProtection, (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    var user_id = req.session.user.maphubsUser.id;
    var data = req.body;
    if (data && data.group_id) {
      Group.allowedToModify(data.group_id, user_id)
      .then((allowed) => {
        if(allowed){
          Group.updateGroup(data.group_id, data.name, data.description, data.location, data.published)
            .then((result) => {
              if (result && result === 1) {
                res.send({
                  success: true
                });
              } else {
                res.send({
                  success: false,
                  error: "Failed to Save Group"
                });
              }
            }).catch(apiError(res, 200));
        }else{
          res.status(401).send();
        }
      });
    } else {
      apiDataError(res);
    }
  });

  app.post('/api/group/delete', csrfProtection, (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    var user_id = req.session.user.maphubsUser.id;
    var data = req.body;
    if (data && data.group_id) {
      //TODO: should be admin, not just a member
      Group.allowedToModify(data.group_id, user_id)
      .then((allowed) => {
        if(allowed){
          Layer.getGroupLayers(data.group_id, true)
          .then((layers) => {
            if(layers && layers.length > 0){
              res.status(200).send({
                success: false,
                error: "Group has layers: You must first delete all the layers in this group"
              });
            }else{
              Group.deleteGroup(data.group_id)
                .then((result) => {
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
                }).catch(apiError(res, 200));
            }
          }).catch(apiError(res, 200));

          }else{
            res.status(401).send();
          }
      });
    } else {
      apiDataError(res);
    }
  });


  app.post('/api/group/setphoto', csrfProtection, (req, res) => {

    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }

    var user_id = req.session.user.maphubsUser.id;
    var data = req.body;

    if(data && data.group_id && data.image){
      Group.allowedToModify(data.group_id, user_id)
      .then((allowed) => {
        if(allowed){
          Image.setGroupImage(data.group_id, data.image, data.info)
          .then(() => {
            res.status(200).send({success: true});
          }).catch(apiError(res, 200));
        } else {
          res.status(401).send();
        }

      }).catch(apiError(res, 200));
    } else {
      apiDataError(res);
    }

  });

  app.post('/api/group/:id/members', csrfProtection, (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    var session_user_id = req.session.user.maphubsUser.id;
    var group_id = req.params.id;

    Group.allowedToModify(group_id, session_user_id)
      .then((allowed) => {
        if(allowed){
          return Group.getGroupMembers(group_id)
          .then((members) => {
            res.status(200).send({success: true, members});
          });
        } else {
          res.status(401).send();
        }
      }).catch(apiError(res, 200));

});

  app.post('/api/group/addmember', csrfProtection, (req, res) => {

    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }

    var session_user_id = req.session.user.maphubsUser.id;
    var data = req.body;

    if(data && data.group_id && data.display_name && data.asAdmin !== undefined){
      User.getUserByName(data.display_name)
      .then((user) => {
        if(user){
          return Group.allowedToModify(data.group_id, session_user_id)
          .then((allowed) => {
            if(allowed){
              var role = 'Member';
              if(data.asAdmin){
                role = 'Administrator';
              }
              return Group.getGroupMembers(data.group_id)
              .then((members) => {
                var alreadyInGroup = false;
                members.forEach((member) => {
                  if(member.id === user.id){
                      alreadyInGroup = true;
                  }
                });
                if(!alreadyInGroup){
                  return Group.addGroupMember(data.group_id, user.id, role)
                  .then(() => {
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
      }).catch(apiError(res, 200));
    } else {
      apiDataError(res);
      return;
    }

  });

  app.post('/api/group/updatememberrole', csrfProtection, (req, res) => {

    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }

    var session_user_id = req.session.user.maphubsUser.id;
    var data = req.body;

    if(data && data.group_id && data.user_id && data.role){
      User.getUser(data.user_id)
      .then((user) => {
        Group.allowedToModify(data.group_id, session_user_id)
        .then((allowed) => {
          if(allowed){
            Group.updateGroupMemberRole(data.group_id, user.id, data.role)
            .then(() => {
              debug('Added role' + data.role + ' to ' + data.display_name + ' of ' + data.group_id);
              res.status(200).send({success: true});
            });
          } else {
            res.status(401).send();
          }
        }).catch(apiError(res, 200));
      }).catch(apiError(res, 200));
    } else {
      apiDataError(res);
    }

  });

    app.post('/api/group/removemember', csrfProtection, (req, res) => {

      if (!req.isAuthenticated || !req.isAuthenticated()) {
        res.status(401).send("Unauthorized, user not logged in");
        return;
      }

      var session_user_id = req.session.user.maphubsUser.id;
      var data = req.body;

      if(data && data.group_id && data.user_id){
        User.getUser(data.user_id)
        .then((user) => {
          Group.allowedToModify(data.group_id, session_user_id)
          .then((allowed) => {
            if(allowed){
              //don't allow removal of last admin
              Group.getGroupMembersByRole(data.group_id, 'Administrator')
              .then((result) => {
                if(result && result.length === 1 && result[0].user_id === session_user_id){
                  //last admin
                  debug('Attempted to delete last admin ' + data.display_name + ' from ' + data.group_id);
                  throw new Error('Unable to delete only administrator from the group. Please assign another admin first.');
                }else{
                  return Group.removeGroupMember(data.group_id, user.id)
                  .then(() => {
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
              }).catch(apiError(res, 200));

              } else {
                res.status(401).send();
              }
          }).catch(apiError(res, 200));
      }).catch(apiError(res, 200));
      } else {
        apiDataError(res);
      }

  });



};
