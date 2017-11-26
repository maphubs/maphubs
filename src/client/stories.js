import React from 'react';
import ReactDOM from 'react-dom';

import Stories from '../views/stories';
if (!global.Intl) {
 require('intl');
 require('intl/locale-data/jsonp/en.js');
 require('intl/locale-data/jsonp/es.js');
 require('intl/locale-data/jsonp/fr.js');
}

require('jquery');
require("materialize-css");


require('../../node_modules/slick-carousel/slick/slick.css');
require('../../node_modules/slick-carousel/slick/slick-theme.css');

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.hydrate(
    <Stories {...data}/>,
    document.querySelector('#app')
  );
});
