const React  = require('react');
const ReactDOM = require('react-dom');

const HubResources = require('../views/hubresources');

require('jquery');
require("materialize-css");


require('../../assets/assets/js/mapbox-gl/mapbox-gl.css');
require('../../assets/assets/js/mapbox-gl/mapbox-gl-draw.css');
require('medium-editor/dist/css/medium-editor.css');
require('medium-editor/dist/css/themes/flat.css');

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <HubResources {...data}/>,
    document.querySelector('#app')
  );
});
