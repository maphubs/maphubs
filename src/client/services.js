import React from 'react';
import ReactDOM from 'react-dom';

import Services from '../views/services';

require('jquery');
require("materialize-css");

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <Services {...data}/>,
    document.querySelector('#app')
  );

});
