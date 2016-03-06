const React  = require('react');
const ReactDOM = require('react-dom');

const HubResources = require('../views/hubresources');

require('jquery');
require("materialize-css");
require("materialize-css/dist/css/materialize.min.css");

require('../css/app.css');
require('../css/feedback-right.css');
require('../node_modules/mapbox-gl/dist/mapbox-gl.css');
require('medium-editor/dist/css/medium-editor.css');
require('medium-editor/dist/css/themes/flat.css');

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <HubResources hub={data.hub} resources={data.resources} canEdit={data.canEdit} locale={data.locale}/>,
    document.querySelector('#app')
  );
});
