const React  = require('react');
const ReactDOM = require('react-dom');

const CreateGroup= require('../views/creategroup');

require('jquery');
require("materialize-css");


require("cropperjs/dist/cropper.css");

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <CreateGroup locale={data.locale} version={data.version}/>,
    document.querySelector('#app')
  );
});
