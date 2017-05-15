import React from 'react';
import ReactDOM from 'react-dom';
import Error from '../views/error';
require("materialize-css");

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <Error {...data}/>,
    document.querySelector('#app')
  );

});
