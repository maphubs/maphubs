const React  = require('react');
const ReactDOM = require('react-dom');

const Terms = require('../views/terms');

require('jquery');
require("materialize-css");

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <Terms {...data}/>,
    document.querySelector('#app')
  );

});
