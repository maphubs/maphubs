const React  = require('react');
const ReactDOM = require('react-dom');

const EditHubStory = require('../views/edithubstory');

require('jquery');
require("materialize-css");

require('../../node_modules/react-colorpickr/dist/colorpickr.css');


require('./story.css');
require('../../assets/assets/js/mapbox-gl/mapbox-gl-0-32-1.css');
require('../../assets/assets/js/mapbox-gl/mapbox-gl-draw.css');
require('medium-editor/dist/css/medium-editor.css');
require('medium-editor/dist/css/themes/flat.css');
require("cropperjs/dist/cropper.css");
require('../../node_modules/slick-carousel/slick/slick.css');
require('../../node_modules/slick-carousel/slick/slick-theme.css');

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <EditHubStory {...data}/>,
    document.querySelector('#app')
  );
});
