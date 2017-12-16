import React from 'react';
import ReactDOM from 'react-dom';

require('jquery');
require("materialize-css");
import StaticMap from '../views/staticmap';

if (!global._babelPolyfill) {
  require('babel-polyfill');
}

require('../../node_modules/mapbox-gl/dist/mapbox-gl.css');
require('@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css');

document.addEventListener('DOMContentLoaded', () => {
  const data = window.__appData;

  ReactDOM.hydrate(
    <StaticMap {...data}/>,
    document.querySelector('#app')
  );
});
