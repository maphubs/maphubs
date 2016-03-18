const React  = require('react');
const ReactDOM = require('react-dom');

const Terms = require('../views/terms');

require('jquery');
require("materialize-css");
require("materialize-css/dist/css/materialize.min.css");
require('../css/app.css');

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <Terms locale={data.locale} version={data.version}/>,
    document.querySelector('#app')
  );

});
