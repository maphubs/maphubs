const babelConfig = {
  babelrc: false,
  presets: [
    ['@babel/env', {
      targets: {
        node: true
      }
    }],
    '@babel/preset-flow'
  ],
  plugins: [
    '@babel/plugin-proposal-export-default-from',
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    '@babel/plugin-transform-runtime'
  ],
  ignore: [/as{2}ets.*|node_modules\/(?!(mapbox-gl|@bit\/kriscarle(?:.maphubs-utils){2}.importers)).*/]
}

require('@babel/register')(babelConfig)

module.exports = require('./server.es6.js')
