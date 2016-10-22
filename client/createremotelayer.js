const React  = require('react');
const ReactDOM = require('react-dom');

const CreateRemoteLayer = require('../views/createremotelayer');

require('babel-polyfill');

require('../node_modules/mapbox-gl/dist/mapbox-gl.css');
require('../node_modules/react-colorpickr/dist/colorpickr.css');
require('../node_modules/codemirror/lib/codemirror.css');

document.addEventListener('DOMContentLoaded', () => {
  localStorage.debug = '*';
  let data = window.__appData;

  ReactDOM.render(
    <CreateRemoteLayer {...data}/>,
    document.querySelector('#app')
  );
});
