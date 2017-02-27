var React = require('react');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');

var TextInput = require('../forms/textInput');
var Toggle = require('../forms/toggle');
var Select = require('../forms/select');

var FormField = React.createClass({

  mixins:[StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
		preset: React.PropTypes.object.isRequired,
    value: React.PropTypes.any
  },

  render() {
    var preset = this.props.preset;
    var field = (
      <TextInput
        name={preset.tag}
        label={preset.label}
        className="col s12 no-margin"
        required={preset.isRequired}
        showCharCount={false}
        value={this.props.value}
      />
    );

    /*
    var presetOptions = [
      {value: 'text', label: this.__('Text')},
      {value: 'localized', label: this.__('Localized Text')},
      {value: 'number', label: this.__('Number')},
      {value: 'radio', label: this.__('Radio Buttons (Choose One)')},
      {value: 'combo', label: this.__('Combo Box (Dropdown)')},
      {value: 'check', label: this.__('Check Box (Yes/No)')}
    ];
    */

    //TODO: add localized string support

    if(preset.type == 'number'){
      field = (
        <TextInput
          name={preset.tag}
          label={preset.label}
          className="col s12 no-margin"
          validations="isNumeric" validationErrors={{
               isNumeric: this.__('Value must be a number')
           }}
          required={preset.isRequired}
          value={this.props.value}
        />
      );
    }else if(preset.type == 'radio' || preset.type == 'combo'){
      var options = {};
      field = (
          <Select
            name={preset.tag} id={'select-' + preset.tag}
            label={preset.label}
            options={options}
            className="col s12 no-margin"
            startEmpty={!this.props.value}
            required={preset.isRequired}
            value={this.props.value}
         />
     );
   }else if(preset.type == 'check'){
      field = (
        <Toggle name={preset.tag}
          labelOff="" labelOn={preset.label}
          className="col s12"
          checked={this.props.value}
        />
      );
    }

    return (
      <div className="row">
        {field}
      </div>
    );
  }
});

module.exports = FormField;
