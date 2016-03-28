const React  = require('react');
const ReactDOM = require('react-dom');

require('babel-polyfill');
require('jquery');
require("materialize-css");
require("materialize-css/dist/css/materialize.min.css");
var StaticMap = require('../views/staticmap');

require('../css/app.css');
require('../css/feedback-left.css');
require('../node_modules/mapbox-gl/dist/mapbox-gl.css');

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <StaticMap name={data.name} layers={data.layers}
      style={data.style} position={data.position} basemap={data.basemap}
      showLegend={data.showLegend} showLogo={data.showLogo} locale={data.locale} version={data.version}/>,
    document.querySelector('#app')
  );
});
