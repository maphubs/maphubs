const React  = require('react');
const ReactDOM = require('react-dom');

const LayerAdmin = require('../views/layeradmin');

require('babel-polyfill');
require('jquery');
require("materialize-css");
require("materialize-css/dist/css/materialize.min.css");
require('../css/app.css');
require('../css/feedback-right.css');
require('../node_modules/mapbox-gl/dist/mapbox-gl.css');
require('../node_modules/react-colorpickr/react-colorpickr.css');
require('../node_modules/codemirror/lib/codemirror.css');

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <LayerAdmin layer={data.layer} groups={data.groups} locale={data.locale}/>,
    document.querySelector('#app')
  );
});
