const React  = require('react');
const ReactDOM = require('react-dom');

const AdminUserInvite = require('../views/adminuserinvite');

require('jquery');
require("materialize-css");


document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <AdminUserInvite {...data}/>,
    document.querySelector('#app')
  );
});
