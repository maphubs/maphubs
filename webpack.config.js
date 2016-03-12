var webpack = require('webpack');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var local = require('./local');
require('babel-polyfill');
var path = require('path');
var pathToMapboxGL = path.resolve(__dirname, 'node_modules/mapbox-gl/dist/mapbox-gl.js');

var PROD = JSON.parse(process.env.PROD_DEV || "0");

if(PROD) console.log('webpack using PROD');

module.exports = {
  devtool: 'eval',
  devServer: {
       devtool: 'eval'
   },
  entry: {
    login: "./client/login",
    approvedialog: "./client/approvedialog",
    groups: "./client/groups",
    groupinfo: "./client/groupinfo",
    groupadmin: "./client/groupadmin",
    creategroup: "./client/creategroup",
    layers: "./client/layers",
    layerinfo: "./client/layerinfo",
    layermap: "./client/layermap",
    layeradmin: "./client/layeradmin",
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
    error: "./client/error",
    usermaps: "./client/usermaps",
    userstories: "./client/userstories",
    embedmap: "./client/embedmap",
    usermap: "./client/usermap",
    staticmap: "./client/staticmap",
    about: "./client/about",
    terms: "./client/terms",
    privacy: "./client/privacy",
    sharedata: "./client/sharedata",
    tellyourstory: "./client/tellyourstory",
    explore: "./client/explore",
    usersettings: "./client/usersettings",
    passwordreset: "./client/passwordreset",
    signup: "./client/signup",
    pendingconfirmation: "./client/pendingconfirmation",
    emailconfirmation: "./client/emailconfirmation",
    vendor: ["materialize-css/dist/css/materialize.min.css", "./css/app.css", "jquery", "slug", "react", "react-dom", "materialize-css", "mapbox-gl", "reflux", "reflux-state-mixin", "mapbox-gl-styles", "debug", "react-notification", "superagent", "bluebird", "classnames", "lodash.isequal", "turf-extent", "turf-meta", "superagent-jsonp", "terraformer"],
    locales: ["./services/locales"],
    clientconfig: ["./clientconfig"]
    //c: ["./c", "./d"] example of multiple files into one output
  },

  resolve: {
    modulesDirectories: ['node_modules'],
    alias: {
      'mapbox-gl': pathToMapboxGL
    },
    extensions: ['', '.js', '.jsx', '.json']
  },

  output: {
    path: local.publicFilePath,
    publicPath: '/public/',
    filename: "[name].js"
  },

  node: {
  fs: "empty"
},

  module: {
    loaders: [
      {
        test: /\.json$/,
        loader: 'json'
      },{
        test: /\.glsl$/,
        loader: 'raw'
      },{
      test: /\.jsx?$/,
      loader: 'babel-loader',

      include: [/views/, /components/, /client/,/react-slick/, /medium-editor/, /reflux-state-mixin/, /react-colorpickr/],
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
      {test: /\.(woff|svg|ttf|eot|gif)([\?]?.*)$/, loader: "file-loader?name=[name].[ext]"}

    ],
    noParse: [pathToMapboxGL]
  },
  plugins: [
    new webpack.ProvidePlugin({
          $: "jquery",
       jQuery: "jquery",
       "window.jQuery": "jquery",
       Materialize: "materialize-css",
       "window.Materialize": "materialize-css"
    }),
    new webpack.optimize.CommonsChunkPlugin({
           names: ["clientconfig", "locales", "vendor"],
                       minChunks: Infinity
   }),
   new ExtractTextPlugin("[name].css"),
   PROD ?  new webpack.optimize.UglifyJsPlugin({minimize: true, compress: true}) : new webpack.optimize.UglifyJsPlugin({minimize: false})


  ]
};

//
//  new webpack.optimize.DedupePlugin(),
