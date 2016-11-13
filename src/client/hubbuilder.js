const React  = require('react');
const ReactDOM = require('react-dom');

const HubBuilder = require('../views/hubbuilder');

require('jquery');
require("materialize-css");

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <HubBuilder {...data}/>,
    document.querySelector('#app')
  );
});
