import React from 'react';
import ReactDOM from 'react-dom';
import Terms from '../views/terms';

import 'jquery';
import 'materialize-css';

if (!global._babelPolyfill) {
  require('babel-polyfill');
}

document.addEventListener('DOMContentLoaded', () => {
  const data = window.__appData;

  ReactDOM.hydrate(
    <Terms {...data}/>,
    document.querySelector('#app')
  );

});
