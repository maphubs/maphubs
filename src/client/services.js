const React  = require('react');
const ReactDOM = require('react-dom');

const Services = require('../views/services');

require('jquery');
require("materialize-css");

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <Services {...data}/>,
    document.querySelector('#app')
  );

});
