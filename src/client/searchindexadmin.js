
const React  = require('react');
const ReactDOM = require('react-dom');

const SearchIndexAdmin = require('../views/searchindexadmin');

require('jquery');
require("materialize-css");

document.addEventListener('DOMContentLoaded', () => {
  localStorage.debug = '*';
  let data = window.__appData;

  ReactDOM.render(
    <SearchIndexAdmin {...data}/>,
    document.querySelector('#app')
  );
});
