import React from 'react';
import ReactDOM from 'react-dom';

import HubResources from '../views/hubresources';

require('jquery');
require("materialize-css");


require('../../assets/assets/js/mapbox-gl/mapbox-gl-0-32-1.css');
require('../../assets/assets/js/mapbox-gl/mapbox-gl-draw.css');
require('medium-editor/dist/css/medium-editor.css');
require('medium-editor/dist/css/themes/flat.css');

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <HubResources {...data}/>,
    document.querySelector('#app')
  );
});
