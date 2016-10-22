const React  = require('react');
const ReactDOM = require('react-dom');

require('babel-polyfill');
require('jquery');
require("materialize-css");
var LayerMap = require('../views/layermap');

require('../node_modules/mapbox-gl/dist/mapbox-gl.css');


document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <LayerMap {...data}/>,
    document.querySelector('#app')
  );
});
