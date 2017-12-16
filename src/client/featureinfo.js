import React from 'react';
import ReactDOM from 'react-dom';

require('jquery');
require("materialize-css");
require("cropperjs/dist/cropper.css");
import FeatureInfo from '../views/featureinfo';

if (!global._babelPolyfill) {
  require('babel-polyfill');
}

require('../../node_modules/mapbox-gl/dist/mapbox-gl.css');
require('@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css');
require('medium-editor/dist/css/medium-editor.css');
require('medium-editor/dist/css/themes/flat.css');


document.addEventListener('DOMContentLoaded', () => {
  const data = window.__appData;

  ReactDOM.hydrate(
    <FeatureInfo {...data}/>,
    document.querySelector('#app')
  );
});
