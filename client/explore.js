const React  = require('react');
const ReactDOM = require('react-dom');

const Explore = require('../views/explore');

require('jquery');
require("materialize-css");
require("materialize-css/dist/css/materialize.min.css");
require('../css/app.css');

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <Explore locale={data.locale}/>,
    document.querySelector('#app')
  );

});
