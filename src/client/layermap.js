import React from 'react';
import ReactDOM from 'react-dom';

require('babel-polyfill');
require('jquery');
require("materialize-css");
import LayerMap from '../views/layermap';

require('../../node_modules/mapbox-gl/dist/mapbox-gl.css');
require('@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css');


document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.hydrate(
    <LayerMap {...data}/>,
    document.querySelector('#app')
  );
});
