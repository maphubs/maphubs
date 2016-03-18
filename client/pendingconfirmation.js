const React  = require('react');
const ReactDOM = require('react-dom');

const PendingConfirmation = require('../views/pendingconfirmation');

require('jquery');
require("materialize-css");
require("materialize-css/dist/css/materialize.min.css");
require('../css/app.css');
require('../css/feedback-right.css');

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <PendingConfirmation user={data.user} locale={data.locale} version={data.version}/>,
    document.querySelector('#app')
  );
});
