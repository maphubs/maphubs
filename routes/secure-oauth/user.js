/* @flow weak */
var libxml = require('libxmljs');
var User = require('../../models/user');
var passport = require('passport');
var nextError = require('../../services/error-response').nextError;

module.exports = function(app) {

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
          generator: MAPHUBS_CONFIG.productName
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
};
