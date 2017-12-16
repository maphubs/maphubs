import React from 'react';
import ReactDOM from 'react-dom';

import GroupAdmin from '../views/groupadmin';

require('jquery');
require("materialize-css");

if (!global._babelPolyfill) {
  require('babel-polyfill');
}

require("cropperjs/dist/cropper.css");

document.addEventListener('DOMContentLoaded', () => {
  const data = window.__appData;

  ReactDOM.hydrate(
    <GroupAdmin {...data}/>,
    document.querySelector('#app')
  );
});
