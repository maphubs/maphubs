import React from 'react';
import ReactDOM from 'react-dom';

import AllGroups from '../views/allgroups';

require('jquery');
require("materialize-css");

require('../../node_modules/slick-carousel/slick/slick.css');
require('../../node_modules/slick-carousel/slick/slick-theme.css');

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.hydrate(
    <AllGroups {...data}/>,
    document.querySelector('#app')
  );

});
