const React  = require('react');
const ReactDOM = require('react-dom');

const CreateLayer = require('../views/createlayer');

require('babel-polyfill');
require('jquery');
require("materialize-css");


require('../node_modules/mapbox-gl/dist/mapbox-gl.css');
require('../node_modules/react-colorpickr/dist/colorpickr.css');
require('../node_modules/codemirror/lib/codemirror.css');

document.addEventListener('DOMContentLoaded', () => {
  localStorage.debug = '*';
  let data = window.__appData;

  ReactDOM.render(
    <CreateLayer groups={data.groups} locale={data.locale} version={data.version}/>,
    document.querySelector('#app')
  );
});
