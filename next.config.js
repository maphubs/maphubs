const withCSS = require('@zeit/next-css')
const path = require('path')

// const TerserPlugin = require('terser-webpack-plugin')

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
    if (dev) {
      /// config.devtool = 'cheap-eval-source-map'
      config.devtool = 'cheap-eval-source-map'
    } else {
      config.devtool = 'source-map'
      if (config.optimization && config.optimization.minimizer) {
        for (const plugin of config.optimization.minimizer) {
          if (plugin.constructor.name === 'TerserPlugin') {
            plugin.options.sourceMap = true
            break
          }
        }
      }
      /*
      config.optimization = {
        minimizer: [new TerserPlugin({
          parallel: true,
          sourceMap: true,
          cache: true
        })]
      }
      */
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
