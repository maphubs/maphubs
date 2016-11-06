var webpack = require('webpack');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var local = require('./local');
require('babel-polyfill');
var path = require('path');
//var pathToMapboxGL = path.resolve(__dirname, 'node_modules/mapbox-gl/dist/mapbox-gl.js');
var pathToMapboxGL = path.resolve(__dirname, 'assets/js/mapbox-gl/mapbox-gl.js');

var pathToPica = path.resolve(__dirname, 'node_modules/pica/dist/pica.min.js');
var pathToMediumEditor = path.resolve(__dirname, 'node_modules/medium-editor/dist/js/medium-editor.js');

module.exports = {
  devtool: 'eval',
  entry: {
    login: "./client/login",
    approvedialog: "./client/approvedialog",
    groups: "./client/groups",
    groupinfo: "./client/groupinfo",
    groupadmin: "./client/groupadmin",
    creategroup: "./client/creategroup",
    usergroups: "./client/usergroups",
    maps: "./client/maps",
    layers: "./client/layers",
    layerinfo: "./client/layerinfo",
    layermap: "./client/layermap",
    layeradmin: "./client/layeradmin",
    addphotopoint: "./client/addphotopoint",
    createlayer: "./client/createlayer",
    createremotelayer: "./client/createremotelayer",
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
    userhubs: "./client/userhubs",
    home: "./client/home",
    search: "./client/search",
    error: "./client/error",
    map: "./client/map",
    mapedit: "./client/mapedit",
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
    vendor: ["jquery", "slug", "react", "react-dom", "materialize-css", "reflux", "reflux-state-mixin", "debug", "react-notification", "superagent", "bluebird", "classnames", "lodash.isequal", "@turf/bbox", "@turf/meta", "superagent-jsonp", "terraformer", "intl", "moment-timezone"],
    locales: ["./services/locales"],
    mapboxgl: ["./assets/js/mapbox-gl/mapbox-gl.js"]
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
   new ExtractTextPlugin("[name].css"),
   new webpack.IgnorePlugin(/^(i18n|winston|winston-loggly|clientconfig)$/),
   new webpack.DefinePlugin({
    'process.env': {
        APP_ENV: JSON.stringify('browser'),
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    }
})
  ],

  externals: {
    'unicode/category/So': '{}'
}
};

//
//  new webpack.optimize.DedupePlugin(),
