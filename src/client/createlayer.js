const React  = require('react');
const ReactDOM = require('react-dom');

const CreateLayer = require('../views/createlayer');

require('babel-polyfill');
require('jquery');
require("materialize-css");


require('../../assets/assets/js/mapbox-gl/mapbox-gl.css');
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
