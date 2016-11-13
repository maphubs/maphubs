const React  = require('react');
const ReactDOM = require('react-dom');

const UserMaps = require('../views/usermaps');

require('babel-polyfill');
require('jquery');
require('../../node_modules/slick-carousel/slick/slick.css');
require('../../node_modules/slick-carousel/slick/slick-theme.css');
require("materialize-css");


document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <UserMaps {...data}/>,
    document.querySelector('#app')
  );
});
