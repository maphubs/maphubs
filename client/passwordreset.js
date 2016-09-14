const React  = require('react');
const ReactDOM = require('react-dom');

const PasswordReset = require('../views/passwordreset');

require('jquery');
require("materialize-css");


document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <PasswordReset passreset={data.passreset} locale={data.locale} version={data.version}/>,
    document.querySelector('#app')
  );
});
