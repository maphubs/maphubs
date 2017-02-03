
const React  = require('react');
const ReactDOM = require('react-dom');

const PageEdit = require('../views/pageedit');

require('jquery');
require("materialize-css");

document.addEventListener('DOMContentLoaded', () => {
  localStorage.debug = '*';
  let data = window.__appData;

  ReactDOM.render(
    <PageEdit {...data}/>,
    document.querySelector('#app')
  );
});
