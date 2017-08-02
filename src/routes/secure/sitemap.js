var local = require('../../local');
var urlUtil = require('../../services/url-util');
var siteMapUtil = require('../../services/sitemap-util');
var Promise = require('bluebird');
var log = require('../../services/log');
var nextError = require('../../services/error-response').nextError;
var knex = require('../../connection');

var sitemap = require('sitemap'),
  sm = sitemap.createSitemap({
      hostname : urlUtil.getBaseUrl(),
      sitemapName: 'Maphubs'
    });

module.exports = function(app) {

  app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    if(local.requireLogin){
      //disallow everything
      res.send('User-agent: *\nDisallow: /');
    }else{
      //don't crawl exports
      res.send('User-agent: *\nDisallow: /*.kml$\nDisallow: /*.zip$\nDisallow: /*.geojson$\nDisallow: /*.gpx$\nDisallow: /*.csv$\nDisallow: /*.svg$\nDisallow: /*.pbf$\nDisallow: /xml/map/*');
    }
  });

  app.get('/sitemapindex.xml', (req, res, next) => {
    if(local.requireLogin){
      return res.status(404).send();
    }
    var baseUrl = urlUtil.getBaseUrl();
    knex.transaction((trx) => {
      return siteMapUtil.getSiteMapIndexFeatureURLs(trx)
      .then(layerUrls => {
        let smi = sitemap.buildSitemapIndex({
          urls:  [ baseUrl + '/sitemap.xml'].concat(layerUrls)
        });
        res.header('Content-Type', 'application/xml');
        return res.send(smi);
      });
    }).catch(nextError(next));
  });

  app.get('/sitemap.:layer_id.xml', (req, res, next) => {
      if(local.requireLogin){
        return res.status(404).send();
      }
      var layer_id = parseInt(req.params.layer_id || '', 10);
      //clear sitemap
      sm.urls = [];
      knex.transaction((trx) => {
      return siteMapUtil.addLayerFeaturesToSiteMap(layer_id, sm, trx)
      .then(() => {
        return Promise.promisify(sm.toXML, {context:sm})()
        .then((xml) => {
          res.header('Content-Type', 'application/xml');
          return res.send(xml);
        }).catch(err=>{
           log.error(err);
           throw err;
        });
      });
      }).catch(nextError(next));

  });

  app.get('/sitemap.xml', (req, res, next) => {
      if(local.requireLogin){
        return res.status(404).send();
      }
      var baseUrl = urlUtil.getBaseUrl();
      //clear sitemap
      sm.urls = [
        {url: baseUrl + '/layers', changefreq: 'daily'},
        {url: baseUrl + '/maps', changefreq: 'daily'},
        {url: baseUrl + '/stories', changefreq: 'daily'},
        {url: baseUrl + '/hubs', changefreq: 'daily'},
        {url: baseUrl + '/groups', changefreq: 'daily'},
        {url: baseUrl + '/about', changefreq: 'weekly'}

      ];

      knex.transaction((trx) => {
        return Promise.all([
          siteMapUtil.addHubsToSiteMap(sm, trx),
          siteMapUtil.addStoriesToSiteMap(sm, trx),
          siteMapUtil.addMapsToSiteMap(sm, trx),
          siteMapUtil.addLayersToSiteMap(sm, trx),
          siteMapUtil.addGroupsToSiteMap(sm, trx)
        ]).then(() => {
           return Promise.promisify(sm.toXML, {context:sm})()
            .then((xml) => {
              res.header('Content-Type', 'application/xml');
              return res.send(xml);
            }).catch(err=>{
              log.error(err);
              throw err;
            });
        });
      }).catch(nextError(next));

  });

};
