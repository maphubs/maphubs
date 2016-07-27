const React  = require('react');
const ReactDOM = require('react-dom');

const MapEdit = require('../views/mapedit');

require('babel-polyfill');
require('jquery');
require('../node_modules/slick-carousel/slick/slick.css');
require('../node_modules/slick-carousel/slick/slick-theme.css');
require('../node_modules/mapbox-gl/dist/mapbox-gl.css');
require('../node_modules/react-colorpickr/dist/colorpickr.css');
require('medium-editor/dist/css/medium-editor.css');
require("materialize-css");

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <MapEdit map={data.map} layers={data.layers} popularLayers={data.popularLayers} myLayers={data.myLayers} locale={data.locale} version={data.version}/>,
    document.querySelector('#app')
  );
});
