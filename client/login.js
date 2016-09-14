const React  = require('react');
const ReactDOM = require('react-dom');

const Login = require('../views/login');

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <Login name={data.name} failed={data.failed} locale={data.locale} version={data.version}/>,
    document.querySelector('#app')
  );
});
