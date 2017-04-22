import React from 'react';
import ReactDOM from 'react-dom';

import Signup from '../views/signup';

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <Signup {...data}/>,
    document.querySelector('#app')
  );
});
