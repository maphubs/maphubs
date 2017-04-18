import React from 'react';
import PropTypes from 'prop-types';
var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');

var Header = require('../components/header');
var Footer = require('../components/footer');

var Error = React.createClass({

  mixins:[StateMixin.connect(LocaleStore, {initWithProps: ['locale', '_csrf']})],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    title: PropTypes.string,
		error: PropTypes.string,
		url: PropTypes.string,
    locale: PropTypes.string.isRequired,
    footerConfig: PropTypes.object
  },

  getDefaultProps() {
    return {
      story: {}
    };
  },


  render() {
    return (
      <div>
        <Header />
        <main>
          <div className="container s12">
            <h3 className="center-align">{this.props.title}</h3>
            <p className="flow-text center-align">{this.props.error}</p>
            <p className="flow-text center-align"><a href={this.props.url} target="_blank">{this.props.url}</a></p>
          </div>
        </main>
        <Footer {...this.props.footerConfig}/>
      </div>
    );
  }
});

module.exports = Error;
