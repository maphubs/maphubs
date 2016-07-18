var webpack = require('webpack');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var local = require('./local');
require('babel-polyfill');
var path = require('path');
var pathToPica = path.resolve(__dirname, 'node_modules/pica/dist/pica.min.js');

module.exports = {
  devtool: 'eval',
  entry: {
    login: "./client/login",
    approvedialog: "./client/approvedialog",
    groups: "./client/groups",
    groupinfo: "./client/groupinfo",
    groupadmin: "./client/groupadmin",
    creategroup: "./client/creategroup",
    maps: "./client/maps",
    layers: "./client/layers",
    layerinfo: "./client/layerinfo",
    layermap: "./client/layermap",
    layeradmin: "./client/layeradmin",
    addphotopoint: "./client/addphotopoint",
    createlayer: "./client/createlayer",
    featureinfo: "./client/featureinfo",
    stories: "./client/stories",
    userstory: "./client/userstory",
    hubstory: "./client/hubstory",
    edithubstory: "./client/edithubstory",
    edituserstory: "./client/edituserstory",
    createhubstory: "./client/createhubstory",
    createuserstory: "./client/createuserstory",
    hubs: "./client/hubs",
    hubinfo: "./client/hubinfo",
    hubbuilder: "./client/hubbuilder",
    hubadmin: "./client/hubadmin",
    hubmap: "./client/hubmap",
    hubstories: "./client/hubstories",
    hubresources: "./client/hubresources",
    home: "./client/home",
    search: "./client/search",
    error: "./client/error",
    map: "./client/map",
    usermaps: "./client/usermaps",
    userstories: "./client/userstories",
    embedmap: "./client/embedmap",
    usermap: "./client/usermap",
    staticmap: "./client/staticmap",
    about: "./client/about",
    terms: "./client/terms",
    privacy: "./client/privacy",
    services: "./client/services",
    journalists: "./client/journalists",
    explore: "./client/explore",
    usersettings: "./client/usersettings",
    passwordreset: "./client/passwordreset",
    signup: "./client/signup",
    pendingconfirmation: "./client/pendingconfirmation",
    emailconfirmation: "./client/emailconfirmation",
    vendor: ["materialize-css/dist/css/materialize.min.css", "./css/app.css", "jquery", "slug", "react", "react-dom", "materialize-css", "mapbox-gl", "reflux", "reflux-state-mixin", "mapbox-gl-styles", "debug", "react-notification", "superagent", "bluebird", "classnames", "lodash.isequal", "turf-extent", "turf-meta", "superagent-jsonp", "terraformer", "intl", "moment-timezone"],
    locales: ["./services/locales"],
    clientconfig: ["./clientconfig"]
  },

  resolve: {
    modulesDirectories: ['node_modules'],
    alias: {
      'webworkify': 'webworkify-webpack'
    },
    extensions: ['', '.js', '.jsx', '.json']
  },

  output: {
    path: local.publicFilePath,
    publicPath: '/public/',
    filename: "[name].js"
  },

  node: {
    fs: "empty",
    i18n: 'empty',
    net: "empty",
    tls: "empty"
  },

  module: {
    loaders: [
      {
        test: /\.json$/,
        loader: 'json'
      },{
        test: /\.(glsl|vert|frag)([\?]?.*)$/,
        loader: 'raw'
      },{
      test: /\.jsx?$/,
      loader: 'babel-loader',

      include: [/i18n\.js/, /locales/, /views/, /components/, /stores/, /actions/, /services/, /client/,/react-slick/, /react-disqus-thread/, /medium-editor/, /reflux-state-mixin/, /react-colorpickr/],
      query: {
        presets: [
          "es2015",
          "react",
          "stage-0"
        ],
        plugins: ['transform-flow-strip-types']
      }
    },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract("style-loader", "css-loader")
      },
      {test: /\.(woff|svg|ttf|eot|gif)([\?]?.*)$/, loader: "file-loader?name=[name].[ext]"},
      {
        test: /\.js$/,
        include: path.resolve('node_modules/mapbox-gl-shaders/index.js'),
        loader: 'transform/cacheable?brfs'
      }


    ],
    postLoaders: [{
          include: /node_modules\/mapbox-gl-shaders/,
          loader: 'transform',
          query: 'brfs'
      }],
    noParse: [
      pathToPica,
      '/node_modules\/json-schema\/lib\/validate\.js/' //https://github.com/request/request/issues/1920
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
          $: "jquery",
       jQuery: "jquery",
       "window.jQuery": "jquery",
       Materialize: "materialize-css",
       "window.Materialize": "materialize-css",
       "mapboxgl": "mapbox-gl"
    }),
    new webpack.optimize.CommonsChunkPlugin({
           names: ["clientconfig", "locales", "vendor"],
                       minChunks: Infinity
   }),
   new ExtractTextPlugin("[name].css"),
   new webpack.IgnorePlugin(/^(i18n|winston|winston-loggly)$/),
   new webpack.DefinePlugin({
    'process.env': {
        APP_ENV: JSON.stringify('browser')
    }
})
  ],

  externals: {
    'unicode/category/So': '{}'
}
};

//
//  new webpack.optimize.DedupePlugin(),
