import React from 'react';
import ReactDOM from 'react-dom';

import PasswordReset from '../views/passwordreset';

require('jquery');
require("materialize-css");


document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <PasswordReset {...data}/>,
    document.querySelector('#app')
  );
});
