const React  = require('react');
const ReactDOM = require('react-dom');

const HubAdmin = require('../views/hubadmin');

require('jquery');
require("materialize-css");
require("materialize-css/dist/css/materialize.min.css");
require('../css/app.css');
require('../css/feedback-right.css');

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <HubAdmin hub={data.hub} layers={data.layers} members={data.members} locale={data.locale}/>,
    document.querySelector('#app')
  );
});
