import React from 'react';
import ReactDOM from 'react-dom';

import Dialog from '../views/approvedialog';

require('jquery');
require("materialize-css");



document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <Dialog {...data}/>,
    document.querySelector('#app')
  );
});
