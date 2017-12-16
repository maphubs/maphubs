import React from 'react';
import ReactDOM from 'react-dom';

import Privacy from '../views/privacy';

require('jquery');
require("materialize-css");

if (!global._babelPolyfill) {
  require('babel-polyfill');
}

document.addEventListener('DOMContentLoaded', () => {
  const data = window.__appData;

  ReactDOM.hydrate(
    <Privacy {...data}/>,
    document.querySelector('#app')
  );

});
