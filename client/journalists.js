const React  = require('react');
const ReactDOM = require('react-dom');

const Journalists = require('../views/journalists');

require('jquery');
require("materialize-css");

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <Journalists locale={data.locale} version={data.version}/>,
    document.querySelector('#app')
  );

});
