import React from 'react';
import ReactDOM from 'react-dom';

import Auth0Login from '../views/auth0login';

if (!global._babelPolyfill) {
  require('babel-polyfill');
}

document.addEventListener('DOMContentLoaded', () => {
  const data = window.__appData;

  ReactDOM.hydrate(
    <Auth0Login {...data}/>,
    document.querySelector('#app')
  );
});
