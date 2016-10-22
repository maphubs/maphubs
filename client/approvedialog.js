const React  = require('react');
const ReactDOM = require('react-dom');

const Dialog = require('../views/approvedialog');

require('jquery');
require("materialize-css");



document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <Dialog {...data}/>,
    document.querySelector('#app')
  );
});
