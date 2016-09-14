const React  = require('react');
const ReactDOM = require('react-dom');

require('babel-polyfill');
require('jquery');
require("materialize-css");
var EmbedMap = require('../views/embedmap');

require('../node_modules/mapbox-gl/dist/mapbox-gl.css');


document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <EmbedMap map={data.map} layers={data.layers} canEdit={data.canEdit} isStatic={data.isStatic} locale={data.locale} version={data.version}/>,
    document.querySelector('#app')
  );
});
