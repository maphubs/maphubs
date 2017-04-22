import React from 'react';
import ReactDOM from 'react-dom';

import EmailConfirmation from '../views/emailconfirmation';

require('jquery');
require("materialize-css");



document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <EmailConfirmation {...data}/>,
    document.querySelector('#app')
  );
});
