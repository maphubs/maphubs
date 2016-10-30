const React  = require('react');
const ReactDOM = require('react-dom');

const Map = require('../views/map');

require('babel-polyfill');
require('jquery');
require('../node_modules/slick-carousel/slick/slick.css');
require('../node_modules/slick-carousel/slick/slick-theme.css');
require('../assets/js/mapbox-gl/mapbox-gl.css');
require('../node_modules/react-colorpickr/dist/colorpickr.css');
require('medium-editor/dist/css/medium-editor.css');
require("materialize-css");

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <Map {...data}/>,
    document.querySelector('#app')
  );
});
