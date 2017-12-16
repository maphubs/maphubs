
import React from 'react';
import ReactDOM from 'react-dom';

import PageEdit from '../views/pageedit';

require('jquery');
require("materialize-css");

if (!global._babelPolyfill) {
  require('babel-polyfill');
}

document.addEventListener('DOMContentLoaded', () => {
  localStorage.debug = '*';
  const data = window.__appData;

  ReactDOM.hydrate(
    <PageEdit {...data}/>,
    document.querySelector('#app')
  );
});
