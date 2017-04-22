import React from 'react';
import ReactDOM from 'react-dom';

import CreateGroup from '../views/creategroup';

require('jquery');
require("materialize-css");


require("cropperjs/dist/cropper.css");

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <CreateGroup {...data}/>,
    document.querySelector('#app')
  );
});
