import React from 'react';
import ReactDOM from 'react-dom';

import Map from '../views/map';

if (!global._babelPolyfill) {
  require('babel-polyfill');
}

require('jquery');
require('../../node_modules/slick-carousel/slick/slick.css');
require('../../node_modules/slick-carousel/slick/slick-theme.css');
require('../../node_modules/mapbox-gl/dist/mapbox-gl.css');
require('@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css');
require('medium-editor/dist/css/medium-editor.css');
require("materialize-css");

document.addEventListener('DOMContentLoaded', () => {
  const data = window.__appData;

  ReactDOM.hydrate(
    <Map {...data}/>,
    document.querySelector('#app')
  );
});
