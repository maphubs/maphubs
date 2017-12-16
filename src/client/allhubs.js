import React from 'react';
import ReactDOM from 'react-dom';

import AllHubs from '../views/allhubs';

require('jquery');
require("materialize-css");

if (!global._babelPolyfill) {
  require('babel-polyfill');
}

require('../../node_modules/slick-carousel/slick/slick.css');
require('../../node_modules/slick-carousel/slick/slick-theme.css');

document.addEventListener('DOMContentLoaded', () => {
  const data = window.__appData;

  ReactDOM.hydrate(
    <AllHubs {...data}/>,
    document.querySelector('#app')
  );
});
