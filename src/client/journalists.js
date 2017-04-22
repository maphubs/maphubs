import React from 'react';
import ReactDOM from 'react-dom';

import Journalists from '../views/journalists';

require('jquery');
require("materialize-css");

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <Journalists {...data}/>,
    document.querySelector('#app')
  );

});
