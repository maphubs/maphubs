const React  = require('react');
const ReactDOM = require('react-dom');

require('babel-polyfill');
require('jquery');
require("materialize-css");
var EmbedMap = require('../views/embedmap');

require('../../assets/assets/js/mapbox-gl/mapbox-gl-0-32-1.css');
require('../../assets/assets/js/mapbox-gl/mapbox-gl-draw.css');


document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <EmbedMap {...data}/>,
    document.querySelector('#app')
  );
});
