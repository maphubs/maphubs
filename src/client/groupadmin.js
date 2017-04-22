import React from 'react';
import ReactDOM from 'react-dom';

import GroupAdmin from '../views/groupadmin';

require('jquery');
require("materialize-css");


require("cropperjs/dist/cropper.css");

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <GroupAdmin {...data}/>,
    document.querySelector('#app')
  );
});
