import React from 'react';
import ReactDOM from 'react-dom';

import Auth0Profile from '../views/auth0profile';

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.hydrate(
    <Auth0Profile {...data}/>,
    document.querySelector('#app')
  );
});
