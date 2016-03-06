const React  = require('react');
const ReactDOM = require('react-dom');

const HubBuilder = require('../views/hubbuilder');

require('jquery');
require("materialize-css");
require("materialize-css/dist/css/materialize.min.css");

require('../css/app.css');
require('../css/feedback-left.css');

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <HubBuilder locale={data.locale}/>,
    document.querySelector('#app')
  );
});
