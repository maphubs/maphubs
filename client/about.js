const React  = require('react');
const ReactDOM = require('react-dom');

const About = require('../views/about');

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <About locale={data.locale} version={data.version}/>,
    document.querySelector('#app')
  );

});
