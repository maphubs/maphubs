const React  = require('react');
const ReactDOM = require('react-dom');

const PasswordReset = require('../views/passwordreset');

require('jquery');
require("materialize-css");


document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <PasswordReset {...data}/>,
    document.querySelector('#app')
  );
});
