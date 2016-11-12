var local = require('../../local');
var urlUtil = require('../../services/url-util');
var siteMapUtil = require('../../services/sitemap-util');
var Promise = require('bluebird');
var log = require('../../services/log');
var nextError = require('../../services/error-response').nextError;

var sitemap = require('sitemap'),
  sm = sitemap.createSitemap({
      hostname : urlUtil.getBaseUrl(local.host, local.port),
      sitemapName: 'Maphubs'
    });

module.exports = function(app) {

  app.get('/robots.txt', function (req, res) {
    res.type('text/plain');
    if(local.requireLogin){
      res.send('User-agent: *');
    }else{
      res.send('User-agent: *\nDisallow: /');
    }
});

  app.get('/sitemap.xml', function(req, res, next){
      if(local.requireLogin){
        return res.status(404).send();
      }
      var baseUrl = urlUtil.getBaseUrl(local.host, local.port);
      //clear sitemap
      sm.urls = [
        {url: baseUrl + '/layers', changefreq: 'daily'},
        {url: baseUrl + '/maps', changefreq: 'daily'},
        {url: baseUrl + '/stories', changefreq: 'daily'},
        {url: baseUrl + '/hubs', changefreq: 'daily'},
        {url: baseUrl + '/groups', changefreq: 'daily'},
        {url: baseUrl + '/about', changefreq: 'weekly'}

      ];

      Promise.all([
        siteMapUtil.addHubsToSiteMap(sm),
        siteMapUtil.addStoriesToSiteMap(sm),
        siteMapUtil.addMapsToSiteMap(sm),
        siteMapUtil.addLayersToSiteMap(sm),
        siteMapUtil.addGroupsToSiteMap(sm)
      ]).then(function(){
        sm.toXML(function(err, xml){
          if(err){
            log.error(err);
            next(err);
          }
            res.header('Content-Type', 'application/xml');
            res.send(xml);
        });
      }).catch(nextError(next));

  });

};
