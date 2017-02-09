var Map = require('../../models/map');
var User = require('../../models/user');
var libxml = require('libxmljs');
var debug = require('../../services/debug')('oembed');
var urlUtil = require('../../services/url-util');

module.exports = function(app) {

  app.get('/api/oembed/map', function(req, res) {

    var url = req.query.url;
    var format = req.query.format;

    var urlArr = url.split('/');



    var map_id = urlArr[urlArr.length-1];

    debug(map_id);

    var baseUrl = urlUtil.getBaseUrl();

    Map.getMap(map_id).then(function(map){
      return User.getUser(map.created_by).then(function(user){

      var url =baseUrl + '/map/embed/' + map.map_id + '/static';
      var imageUrl = baseUrl + '/api/screenshot/map/' + map.map_id + '.png';

      var oembed = {
        type: "rich",
        version: "1.0",
        provider_name: "MapHubs",
        provider_url: baseUrl,
        author_name: user.display_name,
        author_url: '',
        author_id: parseInt(map.created_by),
        title: map.title,
        height: 630,
        width: 1200,
        html: '<iframe src="' + url + '" width="1200" height="630" allowfullscreen frameborder="0"></iframe>',
        thumbnail: imageUrl,
        thumbnail_height: 600,
        thumbnail_width: 315,
        map_id: map.map_id
      };

      if(format == 'xml'){
        var doc = new libxml.Document();
        doc.node('oembed')
        .node('type', oembed.type).parent()
        .node('version', oembed.version).parent()
        .node('provider_name', oembed.provider_name).parent()
        .node('provider_url', oembed.provider_url).parent()
        .node('author_name', oembed.author_name).parent()
        .node('author_url', oembed.author_url).parent()
        .node('author_id', oembed.author_id).parent()
        .node('title', oembed.title).parent()
        .node('html', oembed.html).parent()
        .node('thumbnail', oembed.thumbnail).parent()
        .node('thumbnail_height', oembed.thumbnail_height.toString()).parent()
        .node('thumbnail_width', oembed.thumbnail_width.toString()).parent()
        .node('height', oembed.height.toString()).parent()
        .node('width', oembed.width.toString()).parent()
        .node('map_id', oembed.map_id.toString()).parent();

        res.header("Content-Type", "text/xml");
        res.send(doc.toString());
      }else{
        //just use JSON
        res.status(200).send(oembed);
      }
    });
    });
  });

};
