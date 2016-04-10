/* @flow weak */
var libxml = require('libxmljs');
var User = require('../models/user');
var passport = require('passport');
var log = require('../services/log');
var debug = require('../services/debug')('routes/user');
var apiError = require('../services/error-response').apiError;
var nextError = require('../services/error-response').nextError;
var forceSSL = require('../services/force-ssl');
var PasswordUtil = require('../services/password-util');

module.exports = function(app) {


  app.get('/user/settings', forceSSL, function(req, res, next) {

    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.redirect('/login');
    }
    var user_id = req.session.user.id;
    User.getUser(user_id)
      .then(function(user){
        res.render('usersettings', {title: 'User Settings - MapHubs', props: {user}, req});
      }).catch(nextError(next));
  });

  app.get('/user/passwordreset/:key', function(req, res) {

    var passreset = req.params.key;
    res.render('passwordreset', {title: 'Password Reset - MapHubs', props: {passreset}, req});

  });

  app.get('/signup', forceSSL, function(req, res) {

    res.render('signup', {title: 'Sign Up - MapHubs', props: {}, req});

  });

  app.get('/user/pendingconfirmation', function(req, res, next) {

    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.redirect('/login');
    }
    var user_id = req.session.user.id;
    User.getUser(user_id)
      .then(function(user){
        res.render('pendingconfirmation', {title: req.__('Pending Confirmation') + ' - MapHubs', props: {user}, req});
      }).catch(nextError(next));
  });


  app.get('/user/emailconfirmation/:key', function(req, res, next) {

    var key = req.params.key;

    User.checkEmailConfirmation(key)
    .then(function(valid){
      res.render('emailconfirmation', {title: req.__('Email Confirmed') + ' - MapHubs', props: {valid}, req});
    }).catch(nextError(next));
  });

  //API endpoints

  app.post('/api/user/updatepassword', function(req, res) {
    var data = req.body;
    if (req.isAuthenticated && req.isAuthenticated()) {
      //logged in, confirm that the requested user matches the session user
      var user_id = req.session.user.id;
      if(!data.user_id || user_id != data.user_id){
        res.status(401).send("Unauthorized");
        return;
      }
      PasswordUtil.updatePassword(data.user_id, data.password, true, req.__)
      .then(function(){
        res.status(200).send({success:true});
      }).catch(apiError(res, 500));
    }else {
      User.getUserWithResetKey(data.pass_reset)
      .then(function(user){
        if(user){
          PasswordUtil.updatePassword(user.id, data.password, true, req.__)
          .then(function(){
            res.status(200).send({success:true});
          }).catch(apiError(res, 500));
        } else {
          log.error('Missing or Invalid Reset Key: ' + data.pass_reset);
          res.status(200).send({success:false, error: 'The reset link has expired or may have already been used. Please go to Forgot Password and request another reset.'});
        }
      }).catch(apiError(res, 500));
    }
  });


  app.post('/api/user/setlocale', function(req, res) {
    var data = req.body;
    if(data.locale){
      req.session.locale = data.locale;
      req.setLocale(data.locale);
    }
    res.status(200).send({success: true});

  });

  app.post('/api/user/forgotpassword', function(req, res) {
    var data = req.body;
    PasswordUtil.forgotPassword(data.email, req.__)
    .then(function(){
      res.status(200).send({success:true});
    }).catch(apiError(res, 200));

  });


  app.post('/api/user/checkusernameavailable', function(req, res) {
    var data = req.body;
    if (data && data.username) {
      User.checkUserNameAvailable(data.username)
        .then(function(result) {
          res.status(200).send({
            success: true,
            available: result
          });
        }).catch(apiError(res, 200));
    } else {
      res.status(400).send('Bad Request: required data not found');
    }
  });


  app.post('/api/user/signup', function(req, res, next) {
    var data = req.body;

    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    //create user
    User.createUser(data.email, data.name, data.username, ip)
    .then(function(user_id){
    //set password
      PasswordUtil.updatePassword(user_id, data.password, false, req.__)
      .then(function(){

        User.sendConfirmationEmail(user_id, req.__)
          .then(function(){
            User.sendNewUserAdminEmail(user_id)
            .then(function(){
              //automatically login the user to their new account
              passport.authenticate('local', function(err, user, info) {
                debug(info);
                if (err) { return next(err); }
                if (!user) { return res.redirect('/login'); }
                req.logIn(user, function(err) {
                  if (err) { return next(err); }
                  //save the user to the session
                  req.session.user = {
                    id: req.user.id,
                    display_name: req.user.display_name
                  };
                  res.status(200).send({success:true});
                });
              })(req, res, next);

          }).catch(apiError(res, 500));
        }).catch(apiError(res, 500));
      }).catch(apiError(res, 500));
    }).catch(apiError(res, 500));

  });


  app.post('/api/user/resendconfirmation', function(req, res) {

    //must be logged in
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    var uid = req.user.id;

    User.sendConfirmationEmail(uid)
    .then(function(){
        res.status(200).send({success:true});
    }).catch(apiError(res, 500));

  });


  /**
   * <osm version="0.6" generator="OpenStreetMap server">
   <user display_name="Max Muster" account_created="2006-07-21T19:28:26Z" id="1234">
   <contributor-terms agreed="true" pd="true"/>
   <img href="http://www.openstreetmap.org/attachments/users/images/000/000/1234/original/someLongURLOrOther.JPG"/>
   <roles></roles>
   <changesets count="4182"/>
   <traces count="513"/>
   <blocks>
   <received count="0" active="0"/>
   </blocks>
   <home lat="49.4733718952806" lon="8.89285988577866" zoom="3"/>
   <description>The description of your profile</description>
   <languages>
   <lang>de-DE</lang>
   <lang>de</lang>
   <lang>en-US</lang>
   <lang>en</lang>
   </languages>
   <messages>
   <received count="1" unread="0"/>
   <sent count="0"/>
   </messages>
   </user>
   </osm>
   */
  app.get('/user/details', passport.authenticate('token', {
    session: true
  }), function(req, res, next) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    var uid = req.user.id;

    //#TODO:60 finish populating other user params from the DB
    User.getUser(uid)
      .then(function(user) {
        var doc = new libxml.Document();
        doc.node('osm').attr({
            version: 6,
            generator: 'MapHubs'
          })
          .node('user').attr({
            display_name: user.display_name,
            account_created: user.creation_time,
            id: user.id
          })
          .node('contributor-terms').attr({
            agreed: user.terms_seen,
            pd: user.consider_pd
          }).parent()
          .node('img').attr({
            href: user.image
          }).parent()
          .node('roles').parent()
          .node('changesets').attr({
            count: 0
          }).parent()
          .node('traces').attr({
            count: 0
          }).parent()

        .node('blocks')
          .node('received').attr({
            count: 0,
            active: 0
          }).parent()
          .parent() //end blocks

        .node('home').attr({
            lat: user.home_lat,
            lon: user.home_lon,
            zoom: user.home_zoom
          }).parent()
          .node('description', user.description).parent()

        .node('languages')
          .node('lang', 'en-US').parent()
          .parent() //end languages

        .node('messages')
          .node('received').attr({
            count: 0,
            unread: 0
          }).parent()
          .node('sent').attr({
            count: 0
          }).parent()
          .parent() //end messages

        ;

        res.header("Content-Type", "text/xml");
        res.send(doc.toString());
      }).catch(nextError(next));

  });


  /**
   * Public User Profile
   * @param uid
   *
   * <osm version="0.6" generator="OpenStreetMap server">
   <user id="12023" display_name="jbpbis" account_created="2007-08-16T01:35:56Z">
   <description></description>
   <contributor-terms agreed="false"/>
   <img href="http://www.gravatar.com/avatar/c8c86cd15f60ecca66ce2b10cb6b9a00.jpg?s=256&d=http%3A%2F%2Fwww.openstreetmap.org%2Fassets%2Fusers%2Fimages%2Flarge-39c3a9dc4e778311af6b70ddcf447b58.png"/>
   <roles>
   </roles>
   <changesets count="1"/>
   <traces count="0"/>
   <blocks>
   <received count="0" active="0"/>
   </blocks>
   </user>
   </osm>
   */
  app.get('/api/0.6/user/:id', function(req, res, next) {

    var uid = parseInt(req.params.id || '', 10);

    //#TODO:70 finish populating other user params from the DB
    User.getUser(uid)
      .then(function(user) {
        var doc = new libxml.Document();
        doc.node('osm').attr({
            version: 6,
            generator: 'MapHubs'
          })
          .node('user').attr({
            id: user.id,
            display_name: user.display_name,
            account_created: user.creation_time
          })
          .node('description', user.description).parent()
          .node('contributor-terms').attr({
            agreed: user.terms_seen
          }).parent()
          .node('img').attr({
            href: user.image
          }).parent()
          .node('roles').parent()
          .node('changesets').attr({
            count: 0
          }).parent()
          .node('traces').attr({
            count: 0
          }).parent()

        .node('blocks')
          .node('received').attr({
            count: 0,
            active: 0
          }).parent()
          .parent() //end blocks
        ;

        res.header("Content-Type", "text/xml");
        res.send(doc.toString());
      }).catch(nextError(next));

  });

  app.all('/api/user/details/json', function(req, res) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(200).send({loggedIn: false, user: null});
      return;
    }else{
      var user_id = req.session.user.id;
      User.getUser(user_id)
        .then(function(user){
          //remove sensitive content if present
          delete user.pass_crypt;
          delete user.pass_salt;
          delete user.creation_ip;
          res.status(200).send({loggedIn: true, user});
        }).catch(apiError(res, 500));
    }
  });

  app.get('/api/user/search/suggestions', function(req, res) {
    if (!req.query.q) {
      res.status(400).send('Bad Request: Expected query param. Ex. q=abc');
      return;
    }
    var q = req.query.q;
    User.getSearchSuggestions(q)
      .then(function(result) {
        var suggestions = [];
        result.forEach(function(user) {
          suggestions.push({key: user.id, value:user.display_name});
        });
        res.send({
          suggestions
        });
      }).catch(apiError(res, 500));

  });

};
