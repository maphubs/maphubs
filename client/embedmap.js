const React  = require('react');
const ReactDOM = require('react-dom');

require('jquery');
require("materialize-css");
require("materialize-css/dist/css/materialize.min.css");
var EmbedMap = require('../views/embedmap');

require('../css/app.css');
require('../node_modules/mapbox-gl/dist/mapbox-gl.css');


document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <EmbedMap map={data.map} layers={data.layers} canEdit={data.canEdit} isStatic={data.isStatic} locale={data.locale}/>,
    document.querySelector('#app')
  );
});
