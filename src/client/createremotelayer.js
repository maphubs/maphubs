const React  = require('react');
const ReactDOM = require('react-dom');

const CreateRemoteLayer = require('../views/createremotelayer');

require('babel-polyfill');

require('../../assets/assets/js/mapbox-gl/mapbox-gl-0-32-1.css');
require('../../assets/assets/js/mapbox-gl/mapbox-gl-draw.css');
require('../../node_modules/react-colorpickr/dist/colorpickr.css');

document.addEventListener('DOMContentLoaded', () => {
  localStorage.debug = '*';
  let data = window.__appData;

  ReactDOM.render(
    <CreateRemoteLayer {...data}/>,
    document.querySelector('#app')
  );
});
