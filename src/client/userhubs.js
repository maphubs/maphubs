import React from 'react';
import ReactDOM from 'react-dom';

import UserHubs from '../views/userhubs';

require('jquery');
require('../../node_modules/slick-carousel/slick/slick.css');
require('../../node_modules/slick-carousel/slick/slick-theme.css');
require("materialize-css");

if (!global._babelPolyfill) {
  require('babel-polyfill');
}


document.addEventListener('DOMContentLoaded', () => {
  const data = window.__appData;

  ReactDOM.hydrate(
    <UserHubs {...data}/>,
    document.querySelector('#app')
  );
});
