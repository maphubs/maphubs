const React  = require('react');
const ReactDOM = require('react-dom');

const GroupInfo = require('../views/groupinfo');

require('jquery');
require("materialize-css");
require('../node_modules/slick-carousel/slick/slick.css');
require('../node_modules/slick-carousel/slick/slick-theme.css');


document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <GroupInfo {...data}/>,
    document.querySelector('#app')
  );
});
