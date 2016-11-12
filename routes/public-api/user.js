/* @flow weak */
var libxml = require('libxmljs');
var User = require('../../models/user');
var nextError = require('../../services/error-response').nextError;

module.exports = function(app) {


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
            generator: MAPHUBS_CONFIG.productName
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
};
