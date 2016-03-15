const React  = require('react');
const ReactDOM = require('react-dom');

const Stories = require('../views/stories');

require('jquery');
require('intl');
require("materialize-css");
require("materialize-css/dist/css/materialize.min.css");
require('../css/app.css');
require('../css/feedback-right.css');
require('../node_modules/slick-carousel/slick/slick.css');
require('../node_modules/slick-carousel/slick/slick-theme.css');

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <Stories stories={data.stories} locale={data.locale}/>,
    document.querySelector('#app')
  );
});
