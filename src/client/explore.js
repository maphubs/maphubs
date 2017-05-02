import React from 'react';
import ReactDOM from 'react-dom';

if (!global.Intl) {
 require('intl');
 require('intl/locale-data/jsonp/en.js');
 require('intl/locale-data/jsonp/es.js');
 require('intl/locale-data/jsonp/fr.js');
 require('intl/locale-data/jsonp/it.js');
}

require('babel-polyfill');
require('jquery');

require("materialize-css");
import Explore from '../views/explore';

require('mapbox-gl/dist/mapbox-gl.css');
require('../../assets/assets/js/mapbox-gl/mapbox-gl-draw.css');
require('../../node_modules/slick-carousel/slick/slick.css');
require('../../node_modules/slick-carousel/slick/slick-theme.css');


document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <Explore {...data}/>,
    document.querySelector('#app')
  );
});
