import React from 'react';
import ReactDOM from 'react-dom';

import AdminUserInvite from '../views/adminuserinvite';

require('jquery');
require("materialize-css");

if (!global._babelPolyfill) {
  require('babel-polyfill');
}


document.addEventListener('DOMContentLoaded', () => {
  const data = window.__appData;

  ReactDOM.hydrate(
    <AdminUserInvite {...data}/>,
    document.querySelector('#app')
  );
});
