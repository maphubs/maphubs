import React from 'react';
import ReactDOM from 'react-dom';
if (!global.Intl) {
 require('intl');
 require('intl/locale-data/jsonp/en.js');
 require('intl/locale-data/jsonp/es.js');
 require('intl/locale-data/jsonp/fr.js');
 require('intl/locale-data/jsonp/it.js');
}
require('jquery');
require("materialize-css");
require("cropperjs/dist/cropper.css");
import AddPhotoPoint from '../views/addphotopoint';

if (!global._babelPolyfill) {
  require('babel-polyfill');
}

require('../../node_modules/mapbox-gl/dist/mapbox-gl.css');
require('@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css');



document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.hydrate(
    <AddPhotoPoint {...data}/>,
    document.querySelector('#app')
  );
});
