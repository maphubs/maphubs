import React from 'react';
import ReactDOM from 'react-dom';

import CreateGroup from '../views/creategroup';

require('jquery');
require("materialize-css");

if (!global._babelPolyfill) {
  require('babel-polyfill');
}

require("cropperjs/dist/cropper.css");

document.addEventListener('DOMContentLoaded', () => {
  const data = window.__appData;

  ReactDOM.hydrate(
    <CreateGroup {...data}/>,
    document.querySelector('#app')
  );
});
