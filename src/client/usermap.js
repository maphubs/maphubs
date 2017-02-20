const React  = require('react');
const ReactDOM = require('react-dom');

require('babel-polyfill');
require('jquery');
require("materialize-css");
require('../../node_modules/react-colorpickr/dist/colorpickr.css');
require('medium-editor/dist/css/medium-editor.css');
var UserMap = require('../views/usermap');

require('../../assets/assets/js/mapbox-gl/mapbox-gl-0-32-1.css');
require('../../assets/assets/js/mapbox-gl/mapbox-gl-draw.css');

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <UserMap {...data}/>,
    document.querySelector('#app')
  );
});
