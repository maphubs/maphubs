import React from 'react';
import ReactDOM from 'react-dom';

import Privacy from '../views/privacy';

require('jquery');
require("materialize-css");

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <Privacy {...data}/>,
    document.querySelector('#app')
  );

});
