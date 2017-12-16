import React from 'react';
import ReactDOM from 'react-dom';
import Error from '../views/error';
require("materialize-css");

if (!global._babelPolyfill) {
  require('babel-polyfill');
}

document.addEventListener('DOMContentLoaded', () => {
  const data = window.__appData;

  ReactDOM.hydrate(
    <Error {...data}/>,
    document.querySelector('#app')
  );

});
