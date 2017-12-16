import React from 'react';
import ReactDOM from 'react-dom';

import LayerAdmin from '../views/layeradmin';

require('jquery');
require("materialize-css");

if (!global._babelPolyfill) {
  require('babel-polyfill');
}

require('../../node_modules/mapbox-gl/dist/mapbox-gl.css');
require('@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css');

document.addEventListener('DOMContentLoaded', () => {
  const data = window.__appData;

  ReactDOM.hydrate(
    <LayerAdmin {...data}/>,
    document.querySelector('#app')
  );
});
