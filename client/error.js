const React  = require('react');
const ReactDOM = require('react-dom');

const Error = require('../views/error');

var $ = require('jquery');
require("materialize-css");



document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <Error title={data.title} error={data.error} url={data.url} locale={data.locale} version={data.version}/>,
    document.querySelector('#app')
  );
  $( document ).ready(function(){
    $(".button-collapse").sideNav();
  });

});
