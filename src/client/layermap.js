const React  = require('react');
const ReactDOM = require('react-dom');

require('babel-polyfill');
require('jquery');
require("materialize-css");
var LayerMap = require('../views/layermap');

require('../../assets/js/mapbox-gl/mapbox-gl.css');


document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <LayerMap {...data}/>,
    document.querySelector('#app')
  );
});
