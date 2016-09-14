const React  = require('react');
const ReactDOM = require('react-dom');

const HubAdmin = require('../views/hubadmin');

require('jquery');
require("materialize-css");



document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <HubAdmin hub={data.hub} layers={data.layers} members={data.members} locale={data.locale} version={data.version}/>,
    document.querySelector('#app')
  );
});
