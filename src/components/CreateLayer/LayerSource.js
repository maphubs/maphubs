//@flow
import React from 'react';
import Formsy from 'formsy-react';
import TextInput from '../forms/textInput';
import Select from '../forms/select';
import LayerStore from '../../stores/layer-store';
import LayerActions from '../../actions/LayerActions';
import MessageActions from '../../actions/MessageActions';
import Licenses from './licenses';
import MapHubsComponent from '../MapHubsComponent';
import type {LocaleStoreState} from '../../stores/LocaleStore';
import type {LayerStoreState} from '../../stores/layer-store';

type Props = {
    onSubmit: Function,
    onValid: Function,
    onInValid: Function,
    showPrev: boolean,
    prevText: string,
    onPrev: Function,
    submitText: string
  }

type LayerSourceState = {
  canSubmit: boolean
}

type State = LocaleStoreState & LayerStoreState & LayerSourceState

export default class LayerSource extends MapHubsComponent<void, Props, State> {

  props: Props

  static defaultProps = {
    layer_id: null,
    onSubmit: null,
    active: false,
    submitText: 'Save'
  }

  state: State = {
    canSubmit: false
  }

  constructor(props: Object){
    super(props);
    this.stores.push(LayerStore);
  }

  onSubmit = (formData: Object) => {
    var _this = this;
    //save presets
    LayerActions.saveSource(formData, this.state._csrf, (err) => {
      if(err){
        MessageActions.showMessage({title: _this.__('Error'), message: err});
      }else{
        if(_this.props.onSubmit){
          _this.props.onSubmit();
        }
      }
    });
  }

  onPrev = () => {
    if(this.props.onPrev) this.props.onPrev();
  }

  onValid = () => {
    this.setState({
      canSubmit: true
    });
    if(this.props.onValid){
      this.props.onValid();
    }
  }

  onInvalid = () => {
    this.setState({
      canSubmit: false
    });
    if(this.props.onInValid){
      this.props.onInValid();
    }
  }

	render() {

    var prevButton = '';
    if(this.props.showPrev){
      prevButton = (
        <div className="left">
          <a className="waves-effect waves-light btn" onClick={this.onPrev}><i className="material-icons left">arrow_back</i>{this.props.prevText}</a>
        </div>
      );
    }

    var licenseOptions = Licenses.getLicenses(this.__);

    var license = this.state.license ? this.state.license : 'none';
    
		return (
        <div className="container">

            <Formsy.Form onValidSubmit={this.onSubmit} onValid={this.onValid} onInvalid={this.onInValid}>
              <h5>{this.__('Source Information')}</h5>
              <div className="row">
                <TextInput name="source" label={this.__('Source Description')} icon="explore" className="col s12"
                  value={this.state.source}
                  validations="maxLength:300" validationErrors={{
                       maxLength: this.__('Name must be 300 characters or less.')
                   }} length={300}
                   dataPosition="top" dataTooltip={this.__('Short Description of the Layer Source')}
                   required/>
              </div>
              <div  className="row">
                  <Select name="license" id="layer-source-select" label={this.__('License')} startEmpty={false}
                    value={license} options={licenseOptions}
                    note={this.__('Select a license for more information')}
                    className="col s8"
                    dataPosition="top" dataTooltip={this.__('Layer License')}
                    />
                </div>

              {prevButton}
              <div className="right">
                <button type="submit" className="waves-effect waves-light btn" disabled={!this.state.canSubmit}><i className="material-icons right">arrow_forward</i>{this.props.submitText}</button>
              </div>
              </Formsy.Form>

      </div>
		);
	}
}