import React from 'react';
import ReactDOM from 'react-dom';
import HubBuilder from '../views/hubbuilder';

require('jquery');
require("materialize-css");

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.hydrate(
    <HubBuilder {...data}/>,
    document.querySelector('#app')
  );
});
