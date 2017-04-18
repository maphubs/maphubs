import React from 'react';
import PropTypes from 'prop-types';

var Header = require('../components/header');
var Footer = require('../components/footer');
var Password = require('../components/forms/Password');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');

var PasswordReset = React.createClass({

  mixins:[StateMixin.connect(LocaleStore, {initWithProps: ['locale', '_csrf']})],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    passreset: PropTypes.string.isRequired,
    locale: PropTypes.string.isRequired,
    footerConfig: PropTypes.object
  },

  onSave(){
    window.location = '/login';
  },

  render() {
    return (
      <div>
        <Header />
        <main className="container">
          <div className="row valign-wrapper">
            <div className="col s12 m8 l8 valign" style={{margin: 'auto'}}>
              <h4 className="center">{this.__('Please Enter a New Password')}</h4>
              <Password passreset={this.props.passreset} csrf={this.state._csrf} onSave={this.onSave}/>
            </div>
          </div>
      </main>
      <Footer {...this.props.footerConfig}/>
      </div>
    );
  }
});

module.exports = PasswordReset;
