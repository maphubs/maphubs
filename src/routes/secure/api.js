/* @flow weak */
var libxml = require('libxmljs');

module.exports = function(app) {

  app.get('/api/capabilities', (req, res) => {

    var doc = new libxml.Document();
    doc.node('osm').attr({version: 6, generator: 'MapHubs'})
      .node('api').attr({foo: 'bar'}).parent()
      .node('version').attr({minimum: 6, maximum: 6}).parent()
      .node('tracepoints').attr({per_page: 5000}).parent()
      .node('waynodes').attr({maximum: 2000}).parent()
      .node('changesets').attr({maximum_elements: 50000}).parent()
      .node('timeout').attr({seconds: 300}).parent()
      .node('status').attr({database: 'online', api: 'online', gpx: 'online'}).parent()
    ;

    res.header("Content-Type", "text/xml");
    res.send(doc.toString());

  });

};
