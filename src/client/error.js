import React from 'react';
import ReactDOM from 'react-dom';

import Error from '../views/error';

var $ = require('jquery');
require("materialize-css");



document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <Error {...data}/>,
    document.querySelector('#app')
  );
  $( document ).ready(function(){
    //$(".button-collapse").sideNav();
  });

});
