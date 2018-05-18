const withCSS = require('@zeit/next-css')
const path = require('path')

const {ANALYZE, ASSET_CDN_PREFIX} = process.env

if (ANALYZE) {
  var { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
}

const useCDN = (ASSET_CDN_PREFIX && process.env.NODE_ENV === 'production')
const pathToMapboxGL = path.resolve(__dirname, './node_modules/mapbox-gl/dist/mapbox-gl.js')
const assetPrefix = useCDN ? ASSET_CDN_PREFIX : ''
console.log(`assetPrefix: ${assetPrefix}`)
module.exports = withCSS({
  exportPathMap: () => {
    return {}
  },
  assetPrefix,
  poweredByHeader: false,
  webpack (config, { dev }) {
    console.log(config.devtool)
    if (dev) {
      config.devtool = 'cheap-eval-source-map'
    } else {
      config.devtool = 'source-map'
    }
    for (const options of config.plugins) {
      if (options['constructor']['name'] === 'UglifyJsPlugin') {
        options.options.sourceMap = true
        break
      }
    }

    config.resolve = {
      alias: {
        'mapbox-gl': 'mapbox-gl/dist/mapbox-gl.js'
      }
    }

    config.node = {
      fs: 'empty'
    }

    config.module.rules.push({
      test: /\.(woff|svg|ttf|eot|gif)([\?]?.*)$/,
      use: [{
        loader: 'file-loader',
        options: { publicPath: '/_next/static/', outputPath: 'static/' }
      }]
    })

    config.module.rules.push({
      test: /\.(glsl|vert|frag)([\?]?.*)$/,
      use: [{ loader: 'raw-loader' }]
    })

    if (!config.module.noParse) {
      config.module.noParse = []
    }
    config.module.noParse.push(pathToMapboxGL)

    if (ANALYZE) {
      config.plugins.push(new BundleAnalyzerPlugin({
        analyzerMode: 'server',
        analyzerPort: dev ? 8888 : 8889,
        openAnalyzer: true
      }))
    }

    return config
  }
})
