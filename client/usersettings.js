const React  = require('react');
const ReactDOM = require('react-dom');

const UserSettings = require('../views/usersettings');

require('jquery');
require("materialize-css");
require("materialize-css/dist/css/materialize.min.css");
require('../css/app.css');
require('../css/feedback-right.css');

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <UserSettings user={data.user} locale={data.locale}/>,
    document.querySelector('#app')
  );
});
