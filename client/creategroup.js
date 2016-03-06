const React  = require('react');
const ReactDOM = require('react-dom');

const CreateGroup= require('../views/creategroup');

require('jquery');
require("materialize-css");
require("materialize-css/dist/css/materialize.min.css");

require('../css/app.css');
require('../css/feedback-right.css');

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <CreateGroup locale={data.locale}/>,
    document.querySelector('#app')
  );
});
