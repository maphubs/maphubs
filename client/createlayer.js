const React  = require('react');
const ReactDOM = require('react-dom');

const CreateLayer = require('../views/createlayer');

require('jquery');
require("materialize-css");
require("materialize-css/dist/css/materialize.min.css");

require('../css/app.css');
require('../css/feedback-right.css');
require('../node_modules/mapbox-gl/dist/mapbox-gl.css');
require('../node_modules/react-colorpickr/react-colorpickr.css');

document.addEventListener('DOMContentLoaded', () => {
  localStorage.debug = '*';
  let data = window.__appData;

  ReactDOM.render(
    <CreateLayer groups={data.groups} locale={data.locale}/>,
    document.querySelector('#app')
  );
});
