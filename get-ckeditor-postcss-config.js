const { styles } = require('@ckeditor/ckeditor5-dev-utils')
const postCSSConfig = styles.getPostCssConfig({
  themeImporter: {
    themePath: require.resolve('@ckeditor/ckeditor5-theme-lark')
  },
  minify: false
})
console.log(postCSSConfig)
