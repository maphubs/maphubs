//@flow
import React from 'react';
import Formsy from 'formsy-react';
import TextArea from '../forms/textArea';
import TextInput from '../forms/textInput';
import MultiTextInput from '../forms/MultiTextInput';
import Toggle from '../forms/toggle';
import Select from '../forms/select';
import Actions from '../../actions/LayerActions';
import ConfirmationActions from '../../actions/ConfirmationActions';
import _debounce from 'lodash.debounce';
import _isequal from 'lodash.isequal';
import MapHubsComponent from '../MapHubsComponent';
import Locales from '../../services/locales';

type Props = {
  id: number,
  tag: string,
  label: string,
  type: string,
  options: Array<Object>, //if type requires a list of options
  isRequired: boolean,
  showOnMap: boolean,
  isName: boolean,
  onValid: Function,
  onInvalid: Function
}

type DefaultProps = {
  showOnMap: boolean,
  isRequired: boolean,
  isName: boolean,
}

type State = {
  valid: boolean
}

export default class PresetForm extends MapHubsComponent<DefaultProps, Props, State> {

  props: Props

  static defaultProps: DefaultProps = {
    showOnMap: true,
    isRequired: false,
    isName: false
  }

  state: State

  constructor(props: Props) {
    super(props);
    //if loading with values from the database, assume they are valid
    let valid = false;
    if(props.tag) valid = true;
    this.state = {
      valid
    };
  }

  shouldComponentUpdate(nextProps: Props, nextState: State){
    //only update if something changes
    if(!_isequal(this.props, nextProps)){
      return true;
    }
    if(!_isequal(this.state, nextState)){
      return true;
    }
    return false;
  }

  onFormChange = (values: Object) => {
    var _this = this;
    values.id = this.props.id;
    values.label = Locales.formModelToLocalizedString(values, 'label');
    Actions.updatePreset(_this.props.id, values);
  }

  onValid = () => {
    this.setState({valid: true});
    var debounced = _debounce(function(){
      if(this.props.onValid) this.props.onValid();
    }, 2500).bind(this);
    debounced();
  }

  onInvalid =() => {
    this.setState({valid: false});
    var debounced = _debounce(function(){
      if(this.props.onInvalid) this.props.onInvalid();
    }, 2500).bind(this);
    debounced();
  }

  isValid = () => {
    return this.state.valid;
  }

  onRemove = () => {
    var _this = this;
    ConfirmationActions.showConfirmation({
      title: _this.__('Confirm Removal'),
      message: _this.__('Are you sure you want to remove this field?') + ' '
        + _this.__('Note: this will hide the field, but will not delete the raw data.') + ' '
        + _this.__('The field will still be visible in the edit under "all tags" and will be included in data exports.'),
      onPositiveResponse(){
        Actions.deletePreset(_this.props.id);
      }
    });
  }

  onMoveUp = () => {
    Actions.movePresetUp(this.props.id);
  }

  onMoveDown = () => {
    Actions.movePresetDown(this.props.id);
  }

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

    if(this.props.type === 'combo' || this.props.type === 'radio'){
      typeOptions = (
        <TextArea name="options" label={this.__('Options(seperate with commas)')} icon="list" 
        className="row no-margin" validations="maxLength:500" validationErrors={{
                 maxLength: this.__('Description must be 500 characters or less.')
             }} length={500}
            value={this.props.options}
            dataPosition="top" dataTooltip={this.__('Comma seperated list of options to show for the Combo or Radio field. Ex: red, blue, green')}
           />
      );
    }


    var typeStartEmpty = true;
    if(this.props.type) typeStartEmpty = false;

		return (
        <div>
          <div className="row">
            <Formsy.Form ref="form" onChange={this.onFormChange}
                onValid={this.onValid} onInvalid={this.onInvalid}>
                <div className="row">
                  <div className="col s12 m6">
                    <TextInput 
                      name="tag" 
                      id={this.props.tag+'-tag'} 
                      label={this.__('Tag')} 
                      validations="maxLength:25" validationErrors={{
                          maxLength: this.__('Name must be 25 characters or less.')
                      }} length={25}
                      value={this.props.tag}                 
                      required
                    />
                  </div>
                  <div className="col s12 m6">
                     <Select 
                      name="type" 
                      id="preset-type-select" 
                      label={this.__('Field Type')} 
                      options={presetOptions}
                      value={this.props.type} 
                      startEmpty={typeStartEmpty}
                      required
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col s12 m6">
                    <MultiTextInput 
                      name="label" 
                      id={this.props.tag+'-label'} 
                      label={{
                        en: 'Label', fr: 'Étiquette', es: 'Etiqueta', it: 'Etichetta'
                      }} 
                      validations="maxLength:50" validationErrors={{
                          maxLength: this.__('Name must be 50 characters or less.')
                      }} length={50}
                      value={this.props.label}
                      required
                    />
                   
                  </div>
                   <div className="col s12 m6" style={{textAlign: 'center'}}>
                    <Toggle 
                      name="isRequired" 
                      labelOff="Optional" 
                      labelOn="Required" 
                      className="row no-margin"
                      style={{paddingTop: '25px'}}
                      checked={this.props.isRequired}
                    />
                    <Toggle 
                      name="showOnMap" 
                      labelOff="Hide in Map" 
                      labelOn="Show in Map" 
                      className="row no-margin"
                      style={{paddingTop: '25px'}}
                      checked={this.props.showOnMap}
                    />
                    <Toggle 
                      name="isName" 
                      labelOff="Regular Field" 
                      labelOn="Name Field" 
                      className="row no-margin"
                      style={{paddingTop: '25px'}}
                      checked={this.props.isName}
                    />
                  </div>
                </div>
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
}