import React from 'react';
import ReactDOM from 'react-dom';

require('jquery');
require("materialize-css");
import EmbedMap from '../views/embedmap';

if (!global._babelPolyfill) {
  require('babel-polyfill');
}

require('../../node_modules/mapbox-gl/dist/mapbox-gl.css');
require('@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css');


document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.hydrate(
    <EmbedMap {...data}/>,
    document.querySelector('#app')
  );
});
