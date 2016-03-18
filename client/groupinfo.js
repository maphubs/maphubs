const React  = require('react');
const ReactDOM = require('react-dom');

const GroupInfo = require('../views/groupinfo');

require('jquery');
require("materialize-css");
require("materialize-css/dist/css/materialize.min.css");

require('../css/app.css');
require('../css/feedback-right.css');

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <GroupInfo group={data.group} layers={data.layers} members={data.members} canEdit={data.canEdit} locale={data.locale} version={data.version}/>,
    document.querySelector('#app')
  );
});
