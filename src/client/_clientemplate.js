// @flow
import React from 'react'
import ReactDOM from 'react-dom'

type Config = {
  mapbox: boolean,
  slick: boolean,
  cropper: boolean,
  story: boolean,
  mediumEditor: boolean,
  uppy: boolean,
  debug: boolean
}

module.exports = (name: string, config: Config) => {
  const View = require('../views/' + name).default

  if (!global.Intl) {
    require('intl')
    require('intl/locale-data/jsonp/en.js')
    require('intl/locale-data/jsonp/es.js')
    require('intl/locale-data/jsonp/fr.js')
    require('intl/locale-data/jsonp/it.js')
  }

  if (!global._babelPolyfill) {
    require('babel-polyfill')
  }

  require('jquery')
  require('materialize-css')

  if (config.cropper) {
    require('cropperjs/dist/cropper.css')
  }

  if (config.story) {
    require('./story.css')
  }

  if (config.mapbox) {
    require('../../node_modules/mapbox-gl/dist/mapbox-gl.css')
    require('@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css')
  }

  if (config.uppy) {
    require('uppy/dist/uppy.min.css')
  }

  if (config.mediumEditor) {
    require('medium-editor/dist/css/medium-editor.css')
    require('medium-editor/dist/css/themes/flat.css')
  }

  if (config.slick) {
    require('../../node_modules/slick-carousel/slick/slick.css')
    require('../../node_modules/slick-carousel/slick/slick-theme.css')
  }

  require('react-tippy/dist/tippy.css')

  document.addEventListener('DOMContentLoaded', () => {
    if (config.debug) {
      localStorage.debug = '*'
    }

    const data = window.__appData

    ReactDOM.hydrate(
      <View {...data} />,
      document.querySelector('#app')
    )
  })
}
