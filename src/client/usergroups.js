import React from 'react';
import ReactDOM from 'react-dom';

import UserGroups from '../views/usergroups';

require('babel-polyfill');
require('jquery');
require('../../node_modules/slick-carousel/slick/slick.css');
require('../../node_modules/slick-carousel/slick/slick-theme.css');
require("materialize-css");


document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <UserGroups {...data}/>,
    document.querySelector('#app')
  );
});
