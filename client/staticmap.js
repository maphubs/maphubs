const React  = require('react');
const ReactDOM = require('react-dom');

require('babel-polyfill');
require('jquery');
require("materialize-css");
var StaticMap = require('../views/staticmap');

require('../node_modules/mapbox-gl/dist/mapbox-gl.css');

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <StaticMap name={data.name} layers={data.layers} insetMap={data.insetMap}
      style={data.style} position={data.position} basemap={data.basemap}
      showLegend={data.showLegend} showLogo={data.showLogo} locale={data.locale} version={data.version}/>,
    document.querySelector('#app')
  );
});
