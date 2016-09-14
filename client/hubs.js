const React  = require('react');
const ReactDOM = require('react-dom');

const Hubs = require('../views/hubs');

require('jquery');
require("materialize-css");

require('../node_modules/slick-carousel/slick/slick.css');
require('../node_modules/slick-carousel/slick/slick-theme.css');

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <Hubs featuredHubs={data.featuredHubs} popularHubs={data.popularHubs} recentHubs={data.recentHubs} locale={data.locale} version={data.version}/>,
    document.querySelector('#app')
  );
});
