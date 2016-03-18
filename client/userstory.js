const React  = require('react');
const ReactDOM = require('react-dom');

const UserStory = require('../views/userstory');

require('jquery');
require('intl');
require("materialize-css");
require("materialize-css/dist/css/materialize.min.css");

require('../css/app.css');
require('./story.css');
require('../css/feedback-right.css');
require('../node_modules/mapbox-gl/dist/mapbox-gl.css');

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <UserStory story={data.story} username={data.username} canEdit={data.canEdit} locale={data.locale} version={data.version}/>,
    document.querySelector('#app')
  );
});
