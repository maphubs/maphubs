import React from 'react';
import ReactDOM from 'react-dom';

import ImportLayer from '../views/importlayer';

if (!global._babelPolyfill) {
  require('babel-polyfill');
}

document.addEventListener('DOMContentLoaded', () => {
  localStorage.debug = '*';
  let data = window.__appData;

  ReactDOM.hydrate(
    <ImportLayer {...data}/>,
    document.querySelector('#app')
  );
});
