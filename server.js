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
    '@babel/plugin-proposal-export-default-from'
  ],
  ignore: [/assets.*|node_modules\/(?!(medium-editor|mapbox-gl)).*/]
}

require('@babel/register')(babelConfig)

module.exports = require('./server.es6.js')
