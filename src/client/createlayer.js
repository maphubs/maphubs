import React from 'react';
import ReactDOM from 'react-dom';

import CreateLayer from '../views/createlayer';

require('jquery');
require("materialize-css");

if (!global._babelPolyfill) {
  require('babel-polyfill');
}

require('../../node_modules/mapbox-gl/dist/mapbox-gl.css');
require('@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css');
require('uppy/dist/uppy.min.css');

document.addEventListener('DOMContentLoaded', () => {
  localStorage.debug = '*';
  const data = window.__appData;

  ReactDOM.hydrate(
    <CreateLayer {...data}/>,
    document.querySelector('#app')
  );
});
