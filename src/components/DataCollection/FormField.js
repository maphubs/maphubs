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
		preset: React.PropTypes.object.isRequired
  },

  render() {
    var preset = this.props.preset;
    var field = (
      <TextInput
        name={preset.tag}
        label={preset.label}
        className="col l6 m6 s12"
        required={preset.isRequired}
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
          className="col l6 m6 s12"
          validations="isNumeric" validationErrors={{
               isNumeric: this.__('Value must be a number')
           }}
          required={preset.isRequired}
        />
      );
    }else if(preset.type == 'radio' || preset.type == 'combo'){
      var options = {};
      field = (
          <Select
            name={preset.tag} id={'select-' + preset.tag}
            label={preset.label}
            options={options}
            className="col l6 m6 s12"
            startEmpty={true}
            required={preset.isRequired}
         />
     );
   }else if(preset.type == 'check'){
      field = (
        <Toggle name={preset.tag}
          labelOff="" labelOn={preset.label}
          className="col s12"
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
