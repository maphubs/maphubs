var local = require('./local');
require('./services/inject-maphubs-config');
if(!local.disableTracking) require('newrelic');

var express = require('express'),
  load = require('express-load'),
  passport = require('passport'),
  //util = require('util'),
  path = require('path'),
  logger = require('morgan'),
  cors = require('cors'),
  bodyParser = require('body-parser'),
  cookieParser = require('cookie-parser'),
  xmlparser = require('express-xml-bodyparser'),
   i18n = require("./i18n"),
  compression = require('compression');


var webpack = require("webpack");
var webpackConfig = require('./webpack.config');
var compiler = webpack(webpackConfig);
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
  ignore: /assets.*|node_modules\/(?!(react-data-grid|react-disqus-thread|medium-editor|reflux-state-mixin|react-colorpickr)).*/
});
require('babel-polyfill');

var app = express();
//settings flags
app.enable('trust proxy');
app.disable('view cache'); //cache may be causing weird issues in production, due to our custom React view implementation
app.disable("x-powered-by");

process.on('uncaughtException', function(err) {
  log.error('Caught exception: ' + err.stack);
});

if (app.get('env') !== 'production') {
  require("nodejs-dashboard");
}

//use compression
app.use(compression());

//CORS
app.use(cors());
app.options('*', cors());

//by default set language based on browser 'accept-language' headers
app.use(i18n.init);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'js');
app.engine('js', require('./services/express-react-views').createEngine());


app.use(logger('dev'));
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
    debug: true,
    outputStyle: 'compressed',
    prefix:  '/css'  // Where prefix is at <link rel="stylesheets" href="prefix/style.css"/>
}));

//static files
if(process.env.NODE_ENV !== 'production'){
  app.use('/assets', express.static('./assets/assets'));
}

app.use('/css', express.static('css'));

app.use('/clientconfig.js', express.static('./src/clientconfig.js'));

if (app.get('env') !== 'production') {
  app.use('/edit', express.static('../iD'));
}else{
  app.use('/edit', express.static('./iD'));
}

//use webpack middleware in local dev environment
if(process.env.NODE_ENV !== 'production'){
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
  /*eslint-disable*/
  knex: knex,
  /*eslint-enable*/
  tablename: 'maphubssessions' // optional. Defaults to 'sessions'
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

app.use(passport.initialize());
app.use(passport.session());

//load passport auth config
require('./services/auth');

//load public routes - routes that should always be public, for example login or signup
load('./src/routes/public-routes').into(app);

//load oauth secured api
load('./src/routes/secure-oauth').into(app);

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
load('./src/routes/public-api').into(app);
//load secure routes
load('./src/routes/secure').into(app);

//error handling

app.use(function(req, res, next) {

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
        /*eslint-disable*/
        req: req
        /*eslint-enable*/
      });
      return;
    }

    if (req.accepts('json')) {
      res.send({
        title: req.__('404: Page not found'),
        error: req.__('404: Page not found'),
        url: req.url
      });
    }
}
});


app.use(function(err, req, res, next) {

  //bypass for dynamically created tile URLs
  if(req.url.includes('/api/tiles/')){
    next();
  } else {
  // curl https://localhost:4000/error/403 -vk
  // curl https://localhost:4000/error/403 -vkH "Accept: application/json"
  var statusCode = err.status || 500;
  var statusText = '';
  //var errorDetail = (process.env.NODE_ENV === 'production') ? '' : err.stack;
  var errorDetail = err.stack;

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
      url: req.url
      }
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
server.listen(local.internal_port, function () {
    log.info('**** STARTING SERVER ****');
    log.info('Server Running on port: ' + local.internal_port);
});
