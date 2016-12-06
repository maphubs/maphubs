var webpack = require('webpack');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var local = require('./local');
require('babel-polyfill');
var path = require('path');
//var pathToMapboxGL = path.resolve(__dirname, 'node_modules/mapbox-gl/dist/mapbox-gl.js');
var pathToMapboxGL = path.resolve(__dirname, '../assets/assets/js/mapbox-gl/mapbox-gl.js');

var pathToPica = path.resolve(__dirname, '../node_modules/pica/dist/pica.min.js');
var pathToMediumEditor = path.resolve(__dirname, '../node_modules/medium-editor/dist/js/medium-editor.js');




module.exports = {
  devtool: 'eval',
  entry: {
    login: "./src/client/login",
    approvedialog: "./src/client/approvedialog",
    adminuserinvite: "./src/client/adminuserinvite",
    groups: "./src/client/groups",
    groupinfo: "./src/client/groupinfo",
    groupadmin: "./src/client/groupadmin",
    creategroup: "./src/client/creategroup",
    usergroups: "./src/client/usergroups",
    maps: "./src/client/maps",
    layers: "./src/client/layers",
    layerinfo: "./src/client/layerinfo",
    layermap: "./src/client/layermap",
    layeradmin: "./src/client/layeradmin",
    addphotopoint: "./src/client/addphotopoint",
    createlayer: "./src/client/createlayer",
    createremotelayer: "./src/client/createremotelayer",
    featureinfo: "./src/client/featureinfo",
    stories: "./src/client/stories",
    userstory: "./src/client/userstory",
    hubstory: "./src/client/hubstory",
    edithubstory: "./src/client/edithubstory",
    edituserstory: "./src/client/edituserstory",
    createhubstory: "./src/client/createhubstory",
    createuserstory: "./src/client/createuserstory",
    hubs: "./src/client/hubs",
    hubinfo: "./src/client/hubinfo",
    hubbuilder: "./src/client/hubbuilder",
    hubadmin: "./src/client/hubadmin",
    hubmap: "./src/client/hubmap",
    hubstories: "./src/client/hubstories",
    hubresources: "./src/client/hubresources",
    userhubs: "./src/client/userhubs",
    home: "./src/client/home",
    search: "./src/client/search",
    error: "./src/client/error",
    map: "./src/client/map",
    mapedit: "./src/client/mapedit",
    usermaps: "./src/client/usermaps",
    userstories: "./src/client/userstories",
    embedmap: "./src/client/embedmap",
    usermap: "./src/client/usermap",
    staticmap: "./src/client/staticmap",
    about: "./src/client/about",
    terms: "./src/client/terms",
    privacy: "./src/client/privacy",
    services: "./src/client/services",
    journalists: "./src/client/journalists",
    explore: "./src/client/explore",
    usersettings: "./src/client/usersettings",
    passwordreset: "./src/client/passwordreset",
    signup: "./src/client/signup",
    pendingconfirmation: "./src/client/pendingconfirmation",
    emailconfirmation: "./src/client/emailconfirmation",
    vendor: ["jquery", "slug", "react", "react-dom", "materialize-css", "reflux", "reflux-state-mixin", "debug", "react-notification", "superagent", "bluebird", "classnames", "lodash.isequal", "@turf/bbox", "@turf/meta", "superagent-jsonp", "terraformer", "intl", "moment-timezone"],
    locales: ["./src/services/locales"],
    mapboxgl: ["./assets/assets/js/mapbox-gl/mapbox-gl.js"]
  },
  resolve: {
    modulesDirectories: ['node_modules'],
    alias: {
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

      include: [/i18n\.js/, /locales/, /views/, /components/, /stores/, /actions/, /services/, /client/, /medium-editor/, /react-data-grid/, /react-disqus-thread/, /reflux-state-mixin/, /react-colorpickr/],
      query: {
        presets: [
          "es2015",
          "react",
          "stage-0"
        ],
        plugins: ['transform-flow-strip-types']
      }
    },

      {test: /\.(scss|css)$/, loader: ExtractTextPlugin.extract('style-loader', "css!resolve-url!sass")},
      {test: /\.(woff|svg|ttf|eot|gif)([\?]?.*)$/, loader: "file-loader?name=[name].[ext]"}
    ],
    noParse: [
      pathToPica,
      pathToMapboxGL,
      pathToMediumEditor,
      '/node_modules\/json-schema\/lib\/validate\.js/' //https://github.com/request/request/issues/1920
    ]
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
           names: ["locales", "vendor"],
                       minChunks: Infinity
   }),   
   new webpack.IgnorePlugin(/^(i18n|winston|winston-loggly|clientconfig)$/),
   new webpack.DefinePlugin({
    'process.env': {
        APP_ENV: JSON.stringify('browser'),
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    }
  }),
  new ExtractTextPlugin("[name].css"),
  ],

  externals: {
    'unicode/category/So': '{}'
}
};

//
//  new webpack.optimize.DedupePlugin(),
