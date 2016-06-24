var React = require('react');
var Reflux = require('reflux');
var Formsy = require('formsy-react');
var Select = require('./forms/select');
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

  onChange(model){
    LocaleActions.changeLocale(model.locale);
  },

  shouldComponentUpdate(nextProps, nextState){
    if(this.state.locale != nextState.locale){
      return true;
    }
    return false;
  },

  render() {
   //var _this = this;

    /*
    var enColor = '#000';
    var frColor = '#000';
    var esColor = '#000';
    if(this.state.locale == 'en'){
      enColor = '#29ABE2';
    }else if(this.state.locale == 'fr'){
      frColor = '#29ABE2';
    }else if(this.state.locale == 'es'){
      esColor = '#29ABE2';
    }*/

    var options = [
      {value: 'en', label: 'English'},
      {value: 'fr', label: 'Français'},
      {value: 'es', label: 'Español'},
      {value: 'it', label: 'Italiano'}
    ];

    return (
      <div>
          <Formsy.Form ref="form" onChange={this.onChange}>
              <Select name="locale" id="locale-select" options={options} className="locale-chooser omh-accent-text"
                    value={this.state.locale} defaultValue={this.state.locale} startEmpty={false}
                   dataPosition="left" dataTooltip={this.__('Change Language')}
                   required/>
          </Formsy.Form>
      </div>
    );

  }
});

module.exports = LocaleChooser;
