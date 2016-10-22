const React  = require('react');
const ReactDOM = require('react-dom');

const EditUserStory = require('../views/edituserstory');

require('jquery');
require("materialize-css");
require('../node_modules/react-colorpickr/dist/colorpickr.css');
require('medium-editor/dist/css/medium-editor.css');
require('medium-editor/dist/css/themes/flat.css');


require('./story.css');
require('../node_modules/mapbox-gl/dist/mapbox-gl.css');

require("cropperjs/dist/cropper.css");

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <EditUserStory {...data}/>,
    document.querySelector('#app')
  );
});
