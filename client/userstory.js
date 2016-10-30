const React  = require('react');
const ReactDOM = require('react-dom');

const UserStory = require('../views/userstory');
if (!global.Intl) {
 require('intl');
 require('intl/locale-data/jsonp/en.js');
 require('intl/locale-data/jsonp/es.js');
 require('intl/locale-data/jsonp/fr.js');
}
require('jquery');
require("materialize-css");

require('./story.css');

require('../assets/js/mapbox-gl/mapbox-gl.css');

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <UserStory {...data}/>,
    document.querySelector('#app')
  );
});
