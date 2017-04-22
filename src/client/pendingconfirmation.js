import React from 'react';
import ReactDOM from 'react-dom';

import PendingConfirmation from '../views/pendingconfirmation';

require('jquery');
require("materialize-css");


document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <PendingConfirmation {...data}/>,
    document.querySelector('#app')
  );
});
