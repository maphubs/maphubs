const React  = require('react');
const ReactDOM = require('react-dom');

const Groups = require('../views/groups');

require('jquery');
require("materialize-css");

require('../node_modules/slick-carousel/slick/slick.css');
require('../node_modules/slick-carousel/slick/slick-theme.css');

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <Groups featuredGroups={data.featuredGroups} recentGroups={data.recentGroups} popularGroups={data.popularGroups} locale={data.locale} version={data.version}/>,
    document.querySelector('#app')
  );

});
