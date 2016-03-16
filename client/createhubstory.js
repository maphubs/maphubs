const React  = require('react');
const ReactDOM = require('react-dom');

const CreateHubStory = require('../views/createhubstory');

require('jquery');
require("materialize-css");
require("materialize-css/dist/css/materialize.min.css");
require('../node_modules/react-colorpickr/react-colorpickr.css');
require('../css/app.css');
require('../css/feedback-right.css');
require('./story.css');
require('../node_modules/mapbox-gl/dist/mapbox-gl.css');
require('medium-editor/dist/css/medium-editor.css');
require('medium-editor/dist/css/themes/flat.css');

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <CreateHubStory story={data.story} hub={data.hub} locale={data.locale}/>,
    document.querySelector('#app')
  );
});
