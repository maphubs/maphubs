const React  = require('react');
const ReactDOM = require('react-dom');

const UserMaps = require('../views/usermaps');

require('babel-polyfill');
require('jquery');
require('../node_modules/slick-carousel/slick/slick.css');
require('../node_modules/slick-carousel/slick/slick-theme.css');
require('../node_modules/mapbox-gl/dist/mapbox-gl.css');
require('../node_modules/react-colorpickr/dist/colorpickr.css');
require('medium-editor/dist/css/medium-editor.css');
require("materialize-css");


document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <UserMaps user={data.user} maps={data.maps} myMaps={data.myMaps} locale={data.locale} version={data.version}/>,
    document.querySelector('#app')
  );
});
