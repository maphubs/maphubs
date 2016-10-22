const React  = require('react');
const ReactDOM = require('react-dom');

const UserStories = require('../views/userstories');
if (!global.Intl) {
 require('intl');
 require('intl/locale-data/jsonp/en.js');
 require('intl/locale-data/jsonp/es.js');
 require('intl/locale-data/jsonp/fr.js');
}
require('jquery');
require("materialize-css");

require('./story.css');


document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <UserStories {...data}/>,
    document.querySelector('#app')
  );
});
