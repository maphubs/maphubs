//@flow
var Page = require('../../models/page');
module.exports = function(app: any) {

  app.get('/unauthorized', (req, res) => {
    var path = '';
    if(req.query.path){
      path = req.query.path;
    }
    Page.getPageConfigs(['footer']).then((pageConfigs: Object) => {
      var footerConfig = pageConfigs['footer'];
      res.status(401);
      res.render('error', {
        title: req.__('Unauthorized'),
        props: {
          title: req.__('Unauthorized'),
          error: req.__('You are not authorized to access this page.'),
          url: path,
          footerConfig
        },
        req});
    });
  });

  app.get('/notfound', (req, res) => {
    var path = '';
    if(req.query.path){
      path = req.query.path;
    }
    Page.getPageConfigs(['footer']).then((pageConfigs: Object) => {
      var footerConfig = pageConfigs['footer'];
      res.status(404);
      res.render('error',{
      title: req.__('Page not found'),
      props: {
        title: req.__('Page not found'),
        error: req.__('The page you requested was not found.'),
        url: path,
        footerConfig
      },
      req});
    });
  });

};
