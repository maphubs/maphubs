const React  = require('react');
const ReactDOM = require('react-dom');

const UserSettings = require('../views/usersettings');

require('jquery');
require("materialize-css");



document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <UserSettings {...data}/>,
    document.querySelector('#app')
  );
});
