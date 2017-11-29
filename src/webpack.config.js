var webpack = require('webpack');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var local = require('./local');
var path = require('path');
var pathToMapboxGL = path.resolve(__dirname, '../node_modules/mapbox-gl/dist/mapbox-gl.js');
var pathToMapboxGLDraw = path.resolve(__dirname, '../node_modules/@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.js');
var pathToPica = path.resolve(__dirname, '../node_modules/pica/dist/pica.min.js');
var pathToMediumEditor = path.resolve(__dirname, '../node_modules/medium-editor/dist/js/medium-editor.js');


module.exports = {
  devtool: 'eval',
  entry: {
    auth0login: "./src/client/auth0login",
    auth0profile: "./src/client/auth0profile",
    auth0error: "./src/client/auth0error",
    auth0invite: "./src/client/auth0invite",
    adminuserinvite: "./src/client/adminuserinvite",
    groups: "./src/client/groups",
    allgroups: "./src/client/allgroups",
    groupinfo: "./src/client/groupinfo",
    groupadmin: "./src/client/groupadmin",
    creategroup: "./src/client/creategroup",
    usergroups: "./src/client/usergroups",
    maps: "./src/client/maps",
    allmaps: "./src/client/allmaps",
    layers: "./src/client/layers",
    alllayers: "./src/client/alllayers",
    layerinfo: "./src/client/layerinfo",
    layermap: "./src/client/layermap",
    layeradmin: "./src/client/layeradmin",
    layerreplace: "./src/client/layerreplace",
    addphotopoint: "./src/client/addphotopoint",
    createlayer: "./src/client/createlayer",
    createremotelayer: "./src/client/createremotelayer",
    importlayer: "./src/client/importlayer",
    featureinfo: "./src/client/featureinfo",
    stories: "./src/client/stories",
    allstories: "./src/client/allstories",
    userstory: "./src/client/userstory",
    hubstory: "./src/client/hubstory",
    edithubstory: "./src/client/edithubstory",
    edituserstory: "./src/client/edituserstory",
    createhubstory: "./src/client/createhubstory",
    createuserstory: "./src/client/createuserstory",
    hubs: "./src/client/hubs",
    allhubs: "./src/client/allhubs",
    hubinfo: "./src/client/hubinfo",
    hubbuilder: "./src/client/hubbuilder",
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
    terms: "./src/client/terms",
    privacy: "./src/client/privacy",
    pageedit: "./src/client/pageedit",
    searchindexadmin: "./src/client/searchindexadmin",
    explore: "./src/client/explore",
    vendor: ["babel-polyfill", "jquery", "slugify", "react", "react-dom", "materialize-css", "reflux", "debug", "react-notification", "superagent", "bluebird", "classnames", "lodash.isequal", "@turf/bbox", "@turf/meta", "superagent-jsonp", "terraformer", "intl", "moment-timezone", "mapbox-gl", "turf-jsts", "mapbox-gl-regex-query", "@mapbox/mapbox-gl-draw", "iconv-lite", "urlencode", "elliptic", "react-slick"],
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
        include: [/i18n\.js/, /locales/, /views/, /components/, /stores/, /actions/, /services/, /client/, /medium-editor/],       
        options: {
          presets: [       
           ["env", {
             "browsers": ["> 5%", "not ie <= 11"]
            }],
            "react",
            "stage-0"
          ],
          plugins: ['transform-flow-strip-types', "version-inline"]         
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
  new ExtractTextPlugin({filename: "[name].css"}),
  new webpack.optimize.ModuleConcatenationPlugin()
  ],

  externals: {
    'unicode/category/So': '{}'
}
};
