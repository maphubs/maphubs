import React from 'react';
import ReactDOM from 'react-dom';

import LayerAdmin from '../views/layeradmin';

require('babel-polyfill');
require('jquery');
require("materialize-css");


require('mapbox-gl/dist/mapbox-gl.css');
require('../../assets/assets/js/mapbox-gl/mapbox-gl-draw.css');
require('../../node_modules/react-colorpickr/dist/colorpickr.css');

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <LayerAdmin {...data}/>,
    document.querySelector('#app')
  );
});
