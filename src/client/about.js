import React from 'react';
import ReactDOM from 'react-dom';
import About from '../views/about';

document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <About {...data}/>,
    document.querySelector('#app')
  );

});
