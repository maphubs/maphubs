
import React from 'react';
import ReactDOM from 'react-dom';

import PageEdit from '../views/pageedit';

require('jquery');
require("materialize-css");

document.addEventListener('DOMContentLoaded', () => {
  localStorage.debug = '*';
  let data = window.__appData;

  ReactDOM.render(
    <PageEdit {...data}/>,
    document.querySelector('#app')
  );
});
