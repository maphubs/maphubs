const React  = require('react');
const ReactDOM = require('react-dom');

const MapEdit = require('../views/mapedit');

require('babel-polyfill');
require('jquery');
require('../../node_modules/slick-carousel/slick/slick.css');
require('../../node_modules/slick-carousel/slick/slick-theme.css');
require('../../assets/assets/js/mapbox-gl/mapbox-gl-0-32-1.css');
require('../../assets/assets/js/mapbox-gl/mapbox-gl-draw.css');
require('../../node_modules/react-colorpickr/dist/colorpickr.css');
require('medium-editor/dist/css/medium-editor.css');
require("materialize-css");

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <MapEdit {...data}/>,
    document.querySelector('#app')
  );
});
