const React  = require('react');
const ReactDOM = require('react-dom');

const GroupAdmin = require('../views/groupadmin');

require('jquery');
require("materialize-css");


require("cropperjs/dist/cropper.css");

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <GroupAdmin group={data.group} layers={data.layers} members={data.members} locale={data.locale} version={data.version}/>,
    document.querySelector('#app')
  );
});
