const React  = require('react');
const ReactDOM = require('react-dom');

const EmailConfirmation = require('../views/emailconfirmation');

require('jquery');
require("materialize-css");



document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <EmailConfirmation {...data}/>,
    document.querySelector('#app')
  );
});
