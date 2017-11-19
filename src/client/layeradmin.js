import React from 'react';
import ReactDOM from 'react-dom';

import LayerAdmin from '../views/layeradmin';

require('babel-polyfill');
require('jquery');
require("materialize-css");


require('../../node_modules/mapbox-gl/dist/mapbox-gl.css');
require('@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css');

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.hydrate(
    <LayerAdmin {...data}/>,
    document.querySelector('#app')
  );
});
