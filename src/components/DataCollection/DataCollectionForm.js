//@flow
import React from 'react';
import Formsy from 'formsy-react';
import FormField from './FormField';
import MapHubsComponent from '../MapHubsComponent';
var Locales = require('../../services/locales');

export default class DataCollectionForm extends MapHubsComponent {

  props: {
		presets: Array<Object>,
    values: Object,
    showSubmit: boolean,
    onSubmit: Function,
    onValid: Function,
    onInValid: Function,
    onChange:  Function,
    submitText: string
  }

  static defaultProps: {
    showSubmit: true
  }

  constructor(props: Object){
    super(props);
    var submitText = '';
    if(this.props.submitText){
      submitText = this.props.submitText;
    }else if(this.state && this.state.locale){
      submitText = Locales.getLocaleString(this.state.locale, 'Submit');
    }
    else{
      submitText = 'Submit';
    }
    this.state = {
      canSubmit: false,
      submitText
    };
  }

  onSubmit = (model: Object) => {
    this.props.onSubmit(model);
  }

  onValid = () => {
    this.setState({canSubmit: true});
    if(this.props.onValid) this.props.onValid();
  }

  onInValid = () => {
    this.setState({canSubmit: false});
    if(this.props.onValid) this.props.onInValid();
  }

  onChange = (model: Object) => {
    if(this.props.onChange) this.props.onChange(model);
  }

  render() {
    var _this = this;

    var submit = '';
    if(this.props.showSubmit){
      submit = (
        <div className="right">
          <button type="submit" className="waves-effect waves-light btn" disabled={!this.state.canSubmit}><i className="material-icons right">arrow_forward</i>{this.state.submitText}</button>
        </div>
      );
    }

    return (
      <Formsy.Form onValidSubmit={this.onSubmit} onChange={this.onChange} onValid={this.onValid} onInvalid={this.onInValid}>
        {
          this.props.presets.map(function(preset){
            var value;
            if(_this.props.values && _this.props.values[preset.tag]){
              value = _this.props.values[preset.tag];
            }
            if(preset.tag !== 'photo_url'){
              return (
                <FormField key={preset.tag} preset={preset} value={value} />
              );
            }
          })        
        }
        {submit}
      </Formsy.Form>
    );
  }
}