import React from 'react';
import ReactDOM from 'react-dom';

import CreateLayer from '../views/createlayer';

require('jquery');
require("materialize-css");


require('../../node_modules/mapbox-gl/dist/mapbox-gl.css');
require('@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css');

document.addEventListener('DOMContentLoaded', () => {
  localStorage.debug = '*';
  let data = window.__appData;

  ReactDOM.hydrate(
    <CreateLayer {...data}/>,
    document.querySelector('#app')
  );
});
