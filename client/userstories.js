const React  = require('react');
const ReactDOM = require('react-dom');

const UserStories = require('../views/userstories');

require('jquery');
require('intl');
require("materialize-css");
require("materialize-css/dist/css/materialize.min.css");
require('../css/app.css');
require('./story.css');
require('../css/feedback-right.css');

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <UserStories stories={data.stories} myStories={data.myStories} username={data.username} locale={data.locale} version={data.version}/>,
    document.querySelector('#app')
  );
});
