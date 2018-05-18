let babelConfig = {
  presets: [
    ['@babel/env', {
      'targets': {
        node: true
      }
    }],
    [
      '@babel/preset-stage-0',
      {
        decoratorsLegacy: true
      }
    ],
    '@babel/preset-react',
    '@babel/preset-flow'

  ],
  plugins: ['@babel/plugin-transform-flow-strip-types', 'version-inline'],
  ignore: [/assets.*|node_modules\/(?!(medium-editor|mapbox-gl)).*/]
}

require('@babel/register')(babelConfig)

module.exports = require('./server.es6.js')
