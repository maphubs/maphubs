import React from 'react';
import ReactDOM from 'react-dom';

import Auth0Invite from '../views/auth0invite';

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.hydrate(
    <Auth0Invite {...data}/>,
    document.querySelector('#app')
  );
});
