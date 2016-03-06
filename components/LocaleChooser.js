var React = require('react');
var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var UserStore = require('../stores/UserStore');
var LocaleActions = require('../actions/LocaleActions');
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');

var LocaleChooser = React.createClass({

  mixins:[StateMixin.connect(UserStore), StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  onClick(locale){
    LocaleActions.changeLocale(locale);
  },

  render() {
    var _this = this;
    var enColor = '#000';
    var frColor = '#000';
    var esColor = '#000';
    if(this.state.locale == 'en'){
      enColor = '#29ABE2';
    }else if(this.state.locale == 'fr'){
      frColor = '#29ABE2';
    }else if(this.state.locale == 'es'){
      esColor = '#29ABE2';
    }
    return (
      <div style={{color: '#000'}}>
        <span style={{color: enColor, cursor: 'pointer'}} onClick={function(){_this.onClick('en');}}>EN</span>|
        <span style={{color: frColor, cursor: 'pointer'}} onClick={function(){_this.onClick('fr');}}>FR</span>|
        <span style={{color: esColor, cursor: 'pointer'}} onClick={function(){_this.onClick('es');}}>ES</span>
      </div>
    );

  }
});

module.exports = LocaleChooser;
