const React  = require('react');
const ReactDOM = require('react-dom');

require('babel-polyfill');
require('jquery');
require("materialize-css");
require("cropperjs/dist/cropper.css");
var FeatureInfo = require('../views/featureinfo');

require('../../assets/js/mapbox-gl/mapbox-gl.css');
require('medium-editor/dist/css/medium-editor.css');
require('medium-editor/dist/css/themes/flat.css');


document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <FeatureInfo {...data}/>,
    document.querySelector('#app')
  );
});
