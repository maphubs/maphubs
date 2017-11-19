import React from 'react';
import ReactDOM from 'react-dom';

import ImportLayer from '../views/importlayer';

require('babel-polyfill');

document.addEventListener('DOMContentLoaded', () => {
  localStorage.debug = '*';
  let data = window.__appData;

  ReactDOM.hydrate(
    <ImportLayer {...data}/>,
    document.querySelector('#app')
  );
});
