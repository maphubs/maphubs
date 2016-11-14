var urlUtil = require('../../services/url-util');
var local = require('../../local');
var Map = require('../../models/map');
var libxml = require('libxmljs');
var debug = require('../../services/debug')('oembed');

module.exports = function(app) {

  app.get('/api/oembed/map', function(req, res) {

    var url = req.query.url;
    var format = req.query.format;

    var urlArr = url.split('/');



    var map_id = urlArr[urlArr.length-1];

    debug(map_id);

    Map.getMap(map_id).then(function(map){

      var url = urlUtil.getBaseUrl() + '/map/embed/' + map.map_id + '/static';
      //url = url.replace(/http:/, '');
      //url = url.replace(/https:/, '');

      var imageUrl = urlUtil.getBaseUrl() + '/api/screenshot/map/' + map.map_id + '.png';
      //imageUrl = imageUrl.replace(/http:/, '');
      //imageUrl = imageUrl.replace(/https:/, '');

      var oembed = {
        type: "rich",
        version: "1.0",
        provider_name: "Maphubs",
        provider_url: "https://maphubs.com",
        author_name: '',
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

};
