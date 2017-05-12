var webpack = require('webpack');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var local = require('./local');
require('babel-polyfill');
var path = require('path');
var pathToMapboxGL = path.resolve(__dirname, '../node_modules/mapbox-gl/dist/mapbox-gl.js');
var pathToMapboxGLDraw = path.resolve(__dirname, '../assets/assets/js/mapbox-gl/mapbox-gl-draw.js');
var pathToPica = path.resolve(__dirname, '../node_modules/pica/dist/pica.min.js');
var pathToMediumEditor = path.resolve(__dirname, '../node_modules/medium-editor/dist/js/medium-editor.js');


module.exports = {
  devtool: 'eval',
  entry: {
    auth0login: "./src/client/auth0login",
    auth0profile: "./src/client/auth0profile",
    auth0error: "./src/client/auth0error",
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
    hubstories: "./src/client/hubstories",
    hubresources: "./src/client/hubresources",
    userhubs: "./src/client/userhubs",
    home: "./src/client/home",
    homepro: "./src/client/homepro",
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
    pageedit: "./src/client/pageedit",
    searchindexadmin: "./src/client/searchindexadmin",
    services: "./src/client/services",
    journalists: "./src/client/journalists",
    explore: "./src/client/explore",
    usersettings: "./src/client/usersettings",
    passwordreset: "./src/client/passwordreset",
    signup: "./src/client/signup",
    pendingconfirmation: "./src/client/pendingconfirmation",
    emailconfirmation: "./src/client/emailconfirmation",
    vendor: ["jquery", "slug", "react", "react-dom", "materialize-css", "reflux", "debug", "react-notification", "superagent", "bluebird", "classnames", "lodash.isequal", "@turf/bbox", "@turf/meta", "superagent-jsonp", "terraformer", "intl", "moment-timezone", "mapbox-gl", "jsts"],
    locales: ["./src/services/locales"]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    alias: {
        "mapbox-gl": "mapbox-gl/dist/mapbox-gl.js"
    }
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
    rules: [
      {
        test: /\.(glsl|vert|frag)([\?]?.*)$/,
        use: [{loader: 'raw-loader'}]
      },
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        include: [/i18n\.js/, /locales/, /views/, /components/, /stores/, /actions/, /services/, /client/, /medium-editor/, /react-disqus-thread/, /react-colorpickr/],       
        options: {
          presets: [
           ["es2015", { "modules": false }],
            "react",
            "stage-0"
          ],
          plugins: ['transform-flow-strip-types']         
        }  
      },
      {
        test: /\.(scss|css)$/, 
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: [
            "css-loader",
            "resolve-url-loader",
            "sass-loader"
          ]
        })
      },
      {
        test: /\.(woff|svg|ttf|eot|gif)([\?]?.*)$/, 
        use: [{loader: "file-loader?name=[name].[ext]"}]
      }
    ],
    noParse: [
      pathToPica,
      pathToMapboxGL,
      pathToMapboxGLDraw,
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
   new webpack.IgnorePlugin(/^(i18n|winston|clientconfig)$/),
   new webpack.DefinePlugin({
    'process.env': {
        APP_ENV: JSON.stringify('browser'),
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    }
  }),
  new webpack.BannerPlugin({banner: `MapHubs (https://github.com/maphubs)`, raw: false, entryOnly: true}),
  new ExtractTextPlugin({filename: "[name].css"})
  ],

  externals: {
    'unicode/category/So': '{}'
}
};
