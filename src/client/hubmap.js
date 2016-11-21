const React  = require('react');
const ReactDOM = require('react-dom');

const HubMap = require('../views/hubmap');

require('babel-polyfill');
require('jquery');
require("materialize-css");

require('../../assets/assets/js/mapbox-gl/mapbox-gl.css');
require('medium-editor/dist/css/medium-editor.css');
require('medium-editor/dist/css/themes/flat.css');

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <HubMap {...data}/>,
    document.querySelector('#app')
  );
});
