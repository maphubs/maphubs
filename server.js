
let babelConfig = {
  presets: [
    ['env', {
      'targets': {
        node: true
      }
    }],
    'react',
    'stage-0'
  ],
  plugins: ['transform-flow-strip-types', 'version-inline'],
  ignore: /assets.*|node_modules\/(?!(medium-editor|mapbox-gl)).*/
}

if (process.env.NODE_ENV !== 'production') {
  babelConfig.sourceMaps = true
  babelConfig.retainLines = true
}
require('babel-core/register')(babelConfig)
module.exports = require('./server.es6.js')
