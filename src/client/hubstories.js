import React from 'react';
import ReactDOM from 'react-dom';

import HubStories from '../views/hubstories';
if (!global.Intl) {
 require('intl');
 require('intl/locale-data/jsonp/en.js');
 require('intl/locale-data/jsonp/es.js');
 require('intl/locale-data/jsonp/fr.js');
}
require('jquery');
require("materialize-css");

require('./story.css');

require('mapbox-gl/dist/mapbox-gl.css');
require('../../assets/assets/js/mapbox-gl/mapbox-gl-draw.css');
require('medium-editor/dist/css/medium-editor.css');
require('medium-editor/dist/css/themes/flat.css');

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <HubStories {...data}/>,
    document.querySelector('#app')
  );
});
