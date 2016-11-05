const React  = require('react');
const ReactDOM = require('react-dom');

const LayerAdmin = require('../views/layeradmin');

require('babel-polyfill');
require('jquery');
require("materialize-css");


require('../assets/js/mapbox-gl/mapbox-gl.css');
require('../node_modules/react-colorpickr/dist/colorpickr.css');

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <LayerAdmin {...data}/>,
    document.querySelector('#app')
  );
});
