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
require("cropperjs/dist/cropper.css");
var AddPhotoPoint = require('../views/addphotopoint');

require('../../assets/assets/js/mapbox-gl/mapbox-gl.css');
require('../../assets/assets/js/mapbox-gl/mapbox-gl-draw.css');



document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <AddPhotoPoint {...data}/>,
    document.querySelector('#app')
  );
});
