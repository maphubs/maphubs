let babelConfig = {
  babelrc: false,
  presets: [
    ['@babel/env', {
      'targets': {
        node: true
      }
    }],
    '@babel/preset-flow'
  ],
  plugins: [
    '@babel/plugin-proposal-export-default-from',
    '@babel/plugin-transform-runtime'
  ],
  ignore: [/assets.*|node_modules\/(?!(mapbox-gl|@bit\/kriscarle.maphubs-utils.maphubs-utils.importers)).*/]
}

require('@babel/register')(babelConfig)

module.exports = require('./server.es6.js')
