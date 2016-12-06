
var React = require('react');
var Formsy = require('formsy-react');
var TextArea = require('../forms/textArea');
var TextInput = require('../forms/textInput');
var Toggle = require('../forms/toggle');
var Select = require('../forms/select');
var actions = require('../../actions/presetActions');
var ConfirmationActions = require('../../actions/ConfirmationActions');
var _debounce = require('lodash.debounce');
var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');

var PresetForm = React.createClass({

  mixins:[StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    id: React.PropTypes.number,
		tag: React.PropTypes.string,
    label: React.PropTypes.string,
    type: React.PropTypes.string,
    options: React.PropTypes.array, //if type requires a list of options
    isRequired: React.PropTypes.bool,
    onValid: React.PropTypes.func,
    onInvalid: React.PropTypes.func

  },

  getDefaultProps() {
    return {
    };
  },

  getInitialState() {
    //if loading with values from the database, assume they are valid
    let valid = false;
    if(this.props.tag) valid = true;
    return {
      preset: {
        id: this.props.id,
        tag: this.props.tag,
        label: this.props.label,
        type: this.props.type,
        options: this.props.options,
        isRequired: this.props.isRequired
      },
      valid
    };
  },

  onFormChange(values){
    values.id = this.props.id;
    this.setState({preset: values});
    actions.updatePreset(this.props.id, values);
  },

  onValid(){
    this.setState({valid: true});
    var debounced = _debounce(function(){
      if(this.props.onValid) this.props.onValid();
    }, 2500).bind(this);
    debounced();
  },

  onInvalid(){
    this.setState({valid: false});
    var debounced = _debounce(function(){
      if(this.props.onInvalid) this.props.onInvalid();
    }, 2500).bind(this);
    debounced();
  },

  isValid(){
    return this.state.valid;
  },

  getData(){
    return this.state.preset;
  },

  onRemove(){
    var _this = this;
    ConfirmationActions.showConfirmation({
      title: _this.__('Confirm Removal'),
      message: _this.__('Are you sure you want to remove this field?') + ' '
        + _this.__('Note: this will hide the field, but will not delete the raw data.') + ' '
        + _this.__('The field will still be visible in the edit under "all tags" and will be included in data exports.'),
      onPositiveResponse(){
        actions.deletePreset(_this.props.id);
      }
    });

  },

  onMoveUp(){
  actions.moveUp(this.props.id);
  },

  onMoveDown(){
    actions.moveDown(this.props.id);
  },

	render() {
    var presetOptions = [
      {value: 'text', label: this.__('Text')},
      {value: 'localized', label: this.__('Localized Text')},
      {value: 'number', label: this.__('Number')},
      {value: 'radio', label: this.__('Radio Buttons (Choose One)')},
      {value: 'combo', label: this.__('Combo Box (Dropdown)')},
      {value: 'check', label: this.__('Check Box (Yes/No)')}
    ];

    var typeOptions = '';

    if(this.state.preset.type == 'combo' || this.state.preset.type == 'radio'){
      typeOptions = (
        <TextArea name="options" label={this.__('Options(seperate with commas)')} icon="list" className="col s12" validations="maxLength:500" validationErrors={{
                 maxLength: this.__('Description must be 500 characters or less.')
             }} length={500}
            value={this.state.preset.options}
            dataPosition="top" dataTooltip={this.__('Comma seperated list of options to show for the Combo or Radio field. Ex: red, blue, green')}
           />
      );
    }


    var typeStartEmpty = true;
    if(this.state.preset.type) typeStartEmpty = false;

		return (
        <div>
          <div className="row">
            <Formsy.Form ref="form" onChange={this.onFormChange}
                onValid={this.onValid} onInvalid={this.onInvalid}>
              <TextInput name="tag" id={this.props.tag+'-tag'} label={this.__('Tag')} icon="code" className="col l6 m6 s12"
                  validations="maxLength:25" validationErrors={{
                     maxLength: this.__('Name must be 25 characters or less.')
                 }} length={25}
                  value={this.state.preset.tag}
                  dataPosition="top" dataTooltip={this.__('Short tag for the field')}
                  required/>

                <TextInput name="label" id={this.props.tag+'-label'} label={this.__('Label')} icon="label_outline" className="col l6 m6 s12"
                   validations="maxLength:50" validationErrors={{
                        maxLength: this.__('Name must be 50 characters or less.')
                    }} length={50}
                    value={this.state.preset.label}
                    dataPosition="top" dataTooltip={this.__('Descriptive label for the field that will be shown in editors/forms.')}
                    required/>
                  <Toggle name="isRequired" labelOff="Optional" labelOn="Required" className="col l6 m6 s12"
                       style={{paddingTop: '25px'}}
                       defaultChecked={this.state.preset.isRequired}
                        dataPosition="right" dataTooltip={this.__('Editing/collection tools will require the user to submit this field.')}
                        />
                      <Select name="type" id="preset-type-select" label={this.__('Field Type')} options={presetOptions} className="col l6 m6 s12"
                    value={this.state.preset.type} defaultValue={this.state.preset.type} startEmpty={typeStartEmpty}
                   dataPosition="top" dataTooltip={this.__('Determines how the field is displayed in forms.')}
                   required/>
                 {typeOptions}


            </Formsy.Form>
            </div>
            <div className="row">
              <div className="col s8">
                <a className="waves-effect waves-light btn" onClick={this.onMoveUp}><i className="material-icons left">arrow_upward</i>{this.__('Move Up')}</a>
                <a className="waves-effect waves-light btn" style={{marginLeft: '5px'}} onClick={this.onMoveDown}><i className="material-icons left">arrow_downward</i>{this.__('Move Down')}</a>             
              </div>
              <div className="col s4">
                <a className="waves-effect waves-light btn right" onClick={this.onRemove}><i className="material-icons left">delete</i>{this.__('Remove')}</a>
              </div>
            </div>
      </div>
		);
	}
});

module.exports = PresetForm;
