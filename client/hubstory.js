const React  = require('react');
const ReactDOM = require('react-dom');

const HubStory = require('../views/hubstory');

require('jquery');
require('intl');
require("materialize-css");
require("materialize-css/dist/css/materialize.min.css");

require('../css/app.css');
require('../css/feedback-right.css');
require('./story.css');
require('../node_modules/mapbox-gl/dist/mapbox-gl.css');

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <HubStory story={data.story} hub={data.hub} canEdit={data.canEdit} locale={data.locale}/>,
    document.querySelector('#app')
  );
});
