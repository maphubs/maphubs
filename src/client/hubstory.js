const React  = require('react');
const ReactDOM = require('react-dom');

const HubStory = require('../views/hubstory');
if (!global.Intl) {
 require('intl');
 require('intl/locale-data/jsonp/en.js');
 require('intl/locale-data/jsonp/es.js');
 require('intl/locale-data/jsonp/fr.js');
}
require('jquery');
require("materialize-css");


require('./story.css');
require('../../assets/assets/js/mapbox-gl/mapbox-gl.css');

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <HubStory {...data}/>,
    document.querySelector('#app')
  );
});
