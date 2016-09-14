const React  = require('react');
const ReactDOM = require('react-dom');

const Signup = require('../views/signup');

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <Signup locale={data.locale} version={data.version}/>,
    document.querySelector('#app')
  );
});
