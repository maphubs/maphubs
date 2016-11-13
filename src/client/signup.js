const React  = require('react');
const ReactDOM = require('react-dom');

const Signup = require('../views/signup');

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <Signup {...data}/>,
    document.querySelector('#app')
  );
});
