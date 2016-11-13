const React  = require('react');
const ReactDOM = require('react-dom');

const Login = require('../views/login');

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <Login {...data}/>,
    document.querySelector('#app')
  );
});
