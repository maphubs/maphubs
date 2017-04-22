import React from 'react';
import ReactDOM from 'react-dom';

import Hubs from '../views/hubs';

require('jquery');
require("materialize-css");

require('../../node_modules/slick-carousel/slick/slick.css');
require('../../node_modules/slick-carousel/slick/slick-theme.css');

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <Hubs {...data}/>,
    document.querySelector('#app')
  );
});
