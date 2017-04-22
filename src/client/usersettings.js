import React from 'react';
import ReactDOM from 'react-dom';

import UserSettings from '../views/usersettings';

require('jquery');
require("materialize-css");



document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <UserSettings {...data}/>,
    document.querySelector('#app')
  );
});
