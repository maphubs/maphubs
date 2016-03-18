const React  = require('react');
const ReactDOM = require('react-dom');

require('babel-polyfill');
require('jquery');
require('intl');
require("materialize-css");
require("materialize-css/dist/css/materialize.min.css");
var LayerInfo = require('../views/layerinfo');

require('../css/app.css');
require('../node_modules/mapbox-gl/dist/mapbox-gl.css');
require("../css/react-data-grid.css");


document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <LayerInfo layer={data.layer} canEdit={data.canEdit} stats={data.stats} locale={data.locale} version={data.version}/>,
    document.querySelector('#app')
  );
});
