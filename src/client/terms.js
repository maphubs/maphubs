import React from 'react';
import ReactDOM from 'react-dom';
import Terms from '../views/terms';

import 'jquery';
import 'materialize-css';

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <Terms {...data}/>,
    document.querySelector('#app')
  );

});
