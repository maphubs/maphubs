const React  = require('react');
const ReactDOM = require('react-dom');

require('babel-polyfill');
require('jquery');
require("materialize-css");
var EmbedMap = require('../views/embedmap');

require('../../assets/js/mapbox-gl/mapbox-gl.css');


document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <EmbedMap {...data}/>,
    document.querySelector('#app')
  );
});
