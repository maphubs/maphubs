import React from 'react';
import ReactDOM from 'react-dom';

import Auth0Error from '../views/auth0error';

if (!global._babelPolyfill) {
  require('babel-polyfill');
}

document.addEventListener('DOMContentLoaded', () => {
  const data = window.__appData;

  ReactDOM.hydrate(
    <Auth0Error {...data}/>,
    document.querySelector('#app')
  );
});
