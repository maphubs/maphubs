const React  = require('react');
const ReactDOM = require('react-dom');

const HubAdmin = require('../views/hubadmin');

require('jquery');
require("materialize-css");



document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <HubAdmin {...data}/>,
    document.querySelector('#app')
  );
});
