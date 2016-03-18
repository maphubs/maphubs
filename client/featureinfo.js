const React  = require('react');
const ReactDOM = require('react-dom');

require('babel-polyfill');
require('jquery');
require("materialize-css");
require("materialize-css/dist/css/materialize.min.css");
var FeatureInfo = require('../views/featureinfo');

require('../css/app.css');
require('../node_modules/mapbox-gl/dist/mapbox-gl.css');
require('medium-editor/dist/css/medium-editor.css');
require('medium-editor/dist/css/themes/flat.css');


document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <FeatureInfo feature={data.feature} notes={data.notes} canEdit={data.canEdit} locale={data.locale} version={data.version}/>,
    document.querySelector('#app')
  );
});
