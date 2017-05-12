import React from 'react';
import ReactDOM from 'react-dom';

import Auth0Login from '../views/auth0login';

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <Auth0Login {...data}/>,
    document.querySelector('#app')
  );
});
