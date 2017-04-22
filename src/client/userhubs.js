import React from 'react';
import ReactDOM from 'react-dom';

import UserHubs from '../views/userhubs';

require('babel-polyfill');
require('jquery');
require('../../node_modules/slick-carousel/slick/slick.css');
require('../../node_modules/slick-carousel/slick/slick-theme.css');
require("materialize-css");


document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <UserHubs {...data}/>,
    document.querySelector('#app')
  );
});
