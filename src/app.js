var local = require('./local');
require('./services/inject-maphubs-config');

var express = require('express'),
  consign = require('consign'),
  passport = require('passport'),
  //util = require('util'),
  path = require('path'),
  logger = require('morgan'),
  cors = require('cors'),
  bodyParser = require('body-parser'),
  cookieParser = require('cookie-parser'),
  xmlparser = require('express-xml-bodyparser'),
   i18n = require("./i18n"),
  Raven = require('raven'),
  version = require('../package.json').version,
  shrinkRay = require('shrink-ray');

var session = require('express-session');
var KnexSessionStore = require('connect-session-knex')(session);
var knex = require('./connection.js');
var log = require('./services/log.js');
var sassMiddleware = require('node-sass-middleware');

var Promise = require('bluebird');
//promise config needs to be here so it runs before anything else uses bluebird.
Promise.config({
    // Enable cancellation.
    cancellation: true
});

require('babel-core/register')({
  ignore: /assets.*|node_modules\/(?!(react-disqus-thread|medium-editor|react-colorpickr|mapbox-gl)).*/
});
require('babel-polyfill');

var app = express();
//settings flags
app.enable('trust proxy');
app.disable('view cache'); //cache may be causing weird issues in production, due to our custom React view implementation
app.disable("x-powered-by");

log.info(`Environment: "${app.get('env')}"`);

const ravenConfig = (process.env.NODE_ENV === 'production' && !local.disableTracking) && local.SENTRY_DSN;
Raven.config(ravenConfig, {
  release: version,
  environment: local.ENV_TAG,
  tags: {host: local.host},
  parseUser: ['id', 'display_name', 'email']
}).install();

app.use(Raven.requestHandler());

//use compression
app.use(shrinkRay());

//CORS
app.use(cors());
app.options('*', cors());

//by default set language based on browser 'accept-language' headers
app.use(i18n.init);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'js');
app.engine('js', require('./services/express-react-views').createEngine());



app.use(logger('dev', {
  skip(req) { 
    //don't log every healthcheck ping
    if(req.path === '/healthcheck'){
      return true;
    }
    return false;
  }
}));
app.use(cookieParser());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: false
}));
app.use(xmlparser({explicitArray: false, mergeAttrs: true}));

//compile scss dynamically
app.use(sassMiddleware({
    /* Options */
    src: __dirname,
    dest: path.join(__dirname, '../css'),
    debug: false,
    outputStyle: 'compressed',
    prefix:  '/css'  // Where prefix is at <link rel="stylesheets" href="prefix/style.css"/>
}));

//static files
if(process.env.NODE_ENV !== 'production' || local.useLocalAssets){
  app.use('/assets', express.static('./assets/assets'));
}

if(local.useLocalAssets){
  app.use('/public', express.static('./assets/public'));
}

app.use('/css', express.static('css'));

app.use('/clientconfig.js', express.static('./src/clientconfig.js'));


//use webpack middleware in local dev environment
if(process.env.NODE_ENV !== 'production'){
  var webpack = require("webpack");
  var webpackConfig = require('./webpack.config');
  var compiler = webpack(webpackConfig);
  var webpackDevMiddleware = require("webpack-dev-middleware");
  log.info('Dev: Using Webpack Dev Middleware');
  app.use(webpackDevMiddleware(compiler, {
      publicPath: webpackConfig.output.publicPath,
      stats:{
        chunks: false,
        timings: false,
        assets: false,
        modules: false,
        children: false
      }
  }));
} 


//set sessions (Note: putting this below static files to avoid extra overhead)
var sessionStore = new KnexSessionStore({
  knex,
  tablename: 'maphubssessions' // optional. Defaults to 'sessions'
});

sessionStore.ready = sessionStore.ready.catch(err => {
  log.error(err.message);
});

app.use(session({
  key: 'maphubs',
  secret: local.SESSION_SECRET,
  store: sessionStore,
  resave: false,
  proxy: true,
  saveUninitialized: true,
  cookie: {
        path: '/',
        domain: local.host
    }
}));

app.use((err, req, res, next) => {
  if(err){
    log.error(err.message);
  }
  next();
});


//load passport auth config
require('./services/auth');

app.use(passport.initialize());
app.use(passport.session());



//load public routes - routes that should always be public, for example login or signup
consign().include('./src/routes/public-routes').into(app);

//option to require require login for everything after this point
var checkLogin;
if(local.requireLogin){
   checkLogin = require('connect-ensure-login').ensureLoggedIn();
}else{
  checkLogin = function(req, res, next){
    next();
  };
}
app.use(checkLogin);
//Public API endpoints, these will be secured if login required
//consign().include('./src/routes/public-api').into(app);
//load secure routes
consign().include('./src/routes/secure').into(app);

//error handling

app.use((req, res, next) => {

  //bypass for dynamically created tile URLs
  if(req.url.includes('/api/tiles/') || req.url.includes('/dialog/authorize/decision')){
    next();
  } else {

    res.status(404);

    if (req.accepts('html')) {
      res.render('error', {
        title: req.__('404: Page not found'),
        props: {
          title: req.__('404: Page not found'),
          error: req.__('404: Page not found'),
          url: req.url
        },
        req
      });
    }else if (req.accepts('json')) {
      res.send({
        title: req.__('404: Page not found'),
        error: req.__('404: Page not found'),
        url: req.url
      });
    }
}
});



app.use((err, req, res, next) => {
  if(req.session && req.session.user){
    let username = req.session.user.username ? req.session.user.username : req.session.user.display_name;
    let email = req.session.user._json.email? req.session.user._json.email : req.session.user.email;

    Raven.mergeContext({
      user: {
        id: req.session.user.id,
        username,
        email
      }
    });
  } 
  next(err);
});

app.use(Raven.errorHandler());

app.use((err, req, res, next) => {

  //bypass for dynamically created tile URLs
  if(req.url.includes('/api/tiles/')){
    next();
  } else {
  // curl https://localhost:4000/error/403 -vk
  // curl https://localhost:4000/error/403 -vkH "Accept: application/json"
  var statusCode = err.status || 500;
  var statusText = '';
  var errorDetail = (process.env.NODE_ENV === 'production') ? req.__('Looks like we have a problem. A message was automatically sent to our team.') : err.stack;

  switch (statusCode) {
    case 400:
      statusText = 'Bad Request';
      break;
    case 401:
      statusText = 'Unauthorized';
      break;
    case 403:
      statusText = 'Forbidden';
      break;
    case 500:
      statusText = 'Internal Server Error';
      break;
  }

  log.error(err.stack);

  if (req.accepts('html')) {
    res.status(statusCode).render('error', {
    title: statusCode + ': ' + statusText,
    props: {
      title: statusCode + ': ' + statusText,
      error: errorDetail,
      url: req.url,
      eventId: res.sentry
    },
    req
    });
    return;

  }

  if (req.accepts('json')) {
    res.status(statusCode).send({
      title: statusCode + ': ' + statusText,
      error: errorDetail,
      url: req.url
    });
  }
}
});


var http = require('http');
var server = http.createServer(app);
server.setTimeout(10*60*1000); // 10 * 60 seconds * 1000 msecs
server.listen(local.internal_port, () => {
    log.info('**** STARTING SERVER ****');
    log.info('Server Running on port: ' + local.internal_port);
});
