const React  = require('react');
const ReactDOM = require('react-dom');

if (!global.Intl) {
 require('intl');
 require('intl/locale-data/jsonp/en.js');
 require('intl/locale-data/jsonp/es.js');
 require('intl/locale-data/jsonp/fr.js');
 require('intl/locale-data/jsonp/it.js');
}

require('babel-polyfill');
require('jquery');

require("materialize-css");
require("materialize-css/dist/css/materialize.min.css");
var Home = require('../views/home');

require('../css/app.css');
require('../node_modules/mapbox-gl/dist/mapbox-gl.css');
require('../node_modules/slick-carousel/slick/slick.css');
require('../node_modules/slick-carousel/slick/slick-theme.css');


document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <Home
      trendingLayers={data.trendingLayers}
      trendingGroups={data.trendingGroups}
      trendingHubs={data.trendingHubs}
      trendingMaps={data.trendingMaps}
      trendingStories={data.trendingStories}
      locale={data.locale} version={data.version}/>,
    document.querySelector('#app')
  );
});
