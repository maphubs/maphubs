const React  = require('react');
const ReactDOM = require('react-dom');

require('jquery');
require("materialize-css");
require("materialize-css/dist/css/materialize.min.css");
require('../node_modules/react-colorpickr/react-colorpickr.css');
var UserMap = require('../views/usermap');

require('../css/app.css');
require('../css/feedback-left.css');
require('../node_modules/mapbox-gl/dist/mapbox-gl.css');


document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <UserMap map={data.map} layers={data.layers} canEdit={data.canEdit} locale={data.locale}/>,
    document.querySelector('#app')
  );
});
