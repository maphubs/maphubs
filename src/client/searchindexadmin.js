
import React from 'react';
import ReactDOM from 'react-dom';

import SearchIndexAdmin from '../views/searchindexadmin';

require('jquery');
require("materialize-css");

document.addEventListener('DOMContentLoaded', () => {
  localStorage.debug = '*';
  let data = window.__appData;

  ReactDOM.render(
    <SearchIndexAdmin {...data}/>,
    document.querySelector('#app')
  );
});
