import React from 'react';
import ReactDOM from 'react-dom';

import UserGroups from '../views/usergroups';

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
    <UserGroups {...data}/>,
    document.querySelector('#app')
  );
});
