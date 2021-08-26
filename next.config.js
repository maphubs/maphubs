const path = require('path')
/*
const withTM = require('next-transpile-modules')([
  'react-dnd',
  'dnd-core',
  'react-dnd-html5-backend',
  '@mapbox/mapbox-gl-draw'
])
*/
const withAntdLess = require('next-plugin-antd-less')
const { getThemeVariables } = require('antd/dist/theme')
const lessToJS = require('less-vars-to-js')
const fs = require('fs')
// const { styles } = require('@ckeditor/ckeditor5-dev-utils')

const { ASSET_CDN_PREFIX } = process.env

const useCDN = ASSET_CDN_PREFIX && process.env.NODE_ENV === 'production'
const assetPrefix = useCDN ? ASSET_CDN_PREFIX : ''
console.log(`assetPrefix: ${assetPrefix}`)

/*
const postCSSConfig = styles.getPostCssConfig({
  themeImporter: {
    themePath: require.resolve('@ckeditor/ckeditor5-theme-lark')
  },
  minify: true
})
*/

const antdThemeVariables = getThemeVariables({
  dark: false,
  compact: false
})

const customThemeVariables = lessToJS(
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.readFileSync(path.resolve(__dirname, './theme.less'), 'utf8')
)

const themeVariables = Object.assign(antdThemeVariables, customThemeVariables)

// get a list of Antd vars to customize
//console.log(themeVariables)

const withTM = require('next-transpile-modules')([
  '@mapbox/mapbox-gl-draw',
  'mapbox-gl-dual-scale-control'
])

module.exports = withTM(
  withAntdLess({
    async redirects() {
      return [
        {
          source: '/lyr/:layer_id',
          destination: '/layer/info/:layer_id',
          permanent: false
        }
      ]
    },
    typescript: {
      ignoreBuildErrors: false
    },
    productionBrowserSourceMaps: true,
    // postcssLoaderOptions: postCSSConfig,
    assetPrefix,
    poweredByHeader: false,
    modifyVars: themeVariables,
    webpack(config, { dev, isServer }) {
      return config
    }
  })
)
