import React from 'react';
import ReactDOM from 'react-dom';

import CreateUserStory from '../views/createuserstory';

require('jquery');
require("materialize-css");

require('../../node_modules/react-colorpickr/dist/colorpickr.css');


require('./story.css');
require('../../node_modules/mapbox-gl/dist/mapbox-gl.css');
require('@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css');
require('medium-editor/dist/css/medium-editor.css');
require('medium-editor/dist/css/themes/flat.css');
require("cropperjs/dist/cropper.css");
require('../../node_modules/slick-carousel/slick/slick.css');
require('../../node_modules/slick-carousel/slick/slick-theme.css');

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <CreateUserStory {...data}/>,
    document.querySelector('#app')
  );
});
