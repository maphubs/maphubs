import React from 'react';
import ReactDOM from 'react-dom';

import CreateLayer from '../views/createlayer';

require('babel-polyfill');
require('jquery');
require("materialize-css");


require('../../assets/assets/js/mapbox-gl/mapbox-gl-0-32-1.css');
require('../../assets/assets/js/mapbox-gl/mapbox-gl-draw.css');
require('../../node_modules/react-colorpickr/dist/colorpickr.css');

document.addEventListener('DOMContentLoaded', () => {
  localStorage.debug = '*';
  let data = window.__appData;

  ReactDOM.render(
    <CreateLayer {...data}/>,
    document.querySelector('#app')
  );
});
