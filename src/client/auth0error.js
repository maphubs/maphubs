import React from 'react';
import ReactDOM from 'react-dom';

import Auth0Error from '../views/auth0error';

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <Auth0Error {...data}/>,
    document.querySelector('#app')
  );
});
