const React  = require('react');
const ReactDOM = require('react-dom');

const HubStories = require('../views/hubstories');
if (!global.Intl) {
 require('intl');
 require('intl/locale-data/jsonp/en.js');
 require('intl/locale-data/jsonp/es.js');
 require('intl/locale-data/jsonp/fr.js');
}
require('jquery');
require("materialize-css");

require('./story.css');

require('../node_modules/mapbox-gl/dist/mapbox-gl.css');
require('medium-editor/dist/css/medium-editor.css');
require('medium-editor/dist/css/themes/flat.css');

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <HubStories {...data}/>,
    document.querySelector('#app')
  );
});
