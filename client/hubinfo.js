const React  = require('react');
const ReactDOM = require('react-dom');

const HubInfo = require('../views/hubinfo');

require('babel-polyfill');
require('jquery');
require('intl');
require("materialize-css");
require("materialize-css/dist/css/materialize.min.css");

require('../css/app.css');
require('./story.css');
require('../node_modules/mapbox-gl/dist/mapbox-gl.css');
require('medium-editor/dist/css/medium-editor.css');
require('medium-editor/dist/css/themes/flat.css');

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <HubInfo hub={data.hub} layers={data.layers} stories={data.stories} canEdit={data.canEdit} locale={data.locale}/>,
    document.querySelector('#app')
  );
});
