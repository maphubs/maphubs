import React from 'react';
import ReactDOM from 'react-dom';

import Login from '../views/login';

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <Login {...data}/>,
    document.querySelector('#app')
  );
});
