
module.exports = function(app) {
  app.get('/about', function(req, res) {
    res.render('about', {
      title: 'About - MapHubs',
      props: {},
      req
    });
  });

  app.get('/terms', function(req, res) {
    res.render('terms', {
      title: 'Terms - MapHubs',
      props: {},
      req
    });
  });

  app.get('/privacy', function(req, res) {
    res.render('privacy', {
      title: 'Privacy - MapHubs',
      props: {},
      req
    });
  });

  app.get('/get-started/share-data', function(req, res) {
    res.render('sharedata', {
      title: 'Share Data - MapHubs',
      props: {},
      req
    });
  });

  app.get('/get-started/tell-your-story', function(req, res) {
    res.render('tellyourstory', {
      title: 'Tell Your Story - MapHubs',
      props: {},
      req
    });
  });

  app.get('/get-started/explore', function(req, res) {
    res.render('explore', {
      title: 'Explore - MapHubs',
      props: {},
      req
    });
  });

};
