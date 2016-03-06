const React  = require('react');
const ReactDOM = require('react-dom');

const Signup = require('../views/signup');

require('jquery');
require("materialize-css");
require("materialize-css/dist/css/materialize.min.css");
require('../css/app.css');
require('../css/feedback-right.css');

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <Signup locale={data.locale}/>,
    document.querySelector('#app')
  );
});
