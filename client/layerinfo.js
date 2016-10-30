const React  = require('react');
const ReactDOM = require('react-dom');
if (!global.Intl) {
 require('intl');
 require('intl/locale-data/jsonp/en.js');
 require('intl/locale-data/jsonp/es.js');
 require('intl/locale-data/jsonp/fr.js');
 require('intl/locale-data/jsonp/it.js');
}
require('babel-polyfill');
require('jquery');
require("materialize-css");
var LayerInfo = require('../views/layerinfo');

require('../assets/js/mapbox-gl/mapbox-gl.css');
require("../css/react-data-grid.css");
require('medium-editor/dist/css/medium-editor.css');
require('medium-editor/dist/css/themes/flat.css');


document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <LayerInfo {...data}/>,
    document.querySelector('#app')
  );
});
