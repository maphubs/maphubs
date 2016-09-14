const React  = require('react');
const ReactDOM = require('react-dom');

const EditHubStory = require('../views/edithubstory');

require('jquery');
require("materialize-css");

require('../node_modules/react-colorpickr/dist/colorpickr.css');


require('./story.css');
require('../node_modules/mapbox-gl/dist/mapbox-gl.css');
require('medium-editor/dist/css/medium-editor.css');
require('medium-editor/dist/css/themes/flat.css');
require("cropperjs/dist/cropper.css");

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <EditHubStory story={data.story} hub={data.hub} locale={data.locale} version={data.version}/>,
    document.querySelector('#app')
  );
});
