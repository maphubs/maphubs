import React from 'react';
import ReactDOM from 'react-dom';

require('babel-polyfill');
require('jquery');
require("materialize-css");
import StaticMap from '../views/staticmap';

require('mapbox-gl/dist/mapbox-gl.css');
require('../../assets/assets/js/mapbox-gl/mapbox-gl-draw.css');

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <StaticMap {...data}/>,
    document.querySelector('#app')
  );
});
