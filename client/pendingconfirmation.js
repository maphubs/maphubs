const React  = require('react');
const ReactDOM = require('react-dom');

const PendingConfirmation = require('../views/pendingconfirmation');

require('jquery');
require("materialize-css");


document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <PendingConfirmation {...data}/>,
    document.querySelector('#app')
  );
});
