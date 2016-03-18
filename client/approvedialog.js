const React  = require('react');
const ReactDOM = require('react-dom');

const Dialog = require('../views/approvedialog');

require('jquery');
require("materialize-css");
require("materialize-css/dist/css/materialize.min.css");
require('../css/app.css');
require('../css/feedback-right.css');

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <Dialog transactionID={data.transactionID} user={data.user} client={data.client} locale={data.locale} version={data.version}/>,
    document.querySelector('#app')
  );
});
