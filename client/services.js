const React  = require('react');
const ReactDOM = require('react-dom');

const Services = require('../views/services');

require('jquery');
require("materialize-css");

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <Services locale={data.locale} version={data.version}/>,
    document.querySelector('#app')
  );

});
