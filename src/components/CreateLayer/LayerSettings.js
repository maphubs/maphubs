//@flow
import React from 'react';
import Formsy from 'formsy-react';
import MultiTextArea from '../forms/MultiTextArea';
import MultiTextInput from '../forms/MultiTextInput';
import SelectGroup from '../Groups/SelectGroup';
import Select from '../forms/select';
import Licenses from './licenses';
import LayerStore from '../../stores/layer-store';
import LayerActions from '../../actions/LayerActions';
import MessageActions from '../../actions/MessageActions';
import MapHubsComponent from '../MapHubsComponent';
import type {LocaleStoreState} from '../../stores/LocaleStore';
import type {LayerStoreState} from '../../stores/layer-store';
import type {Group} from '../../stores/GroupStore';
import Locales from '../../services/locales';

type Props = {|
  onSubmit: Function,
  onValid?: Function,
  onInValid?: Function,
  submitText: string,
  showGroup: boolean,
  showPrev?: boolean,
  onPrev?: Function,
  prevText?: string,
  warnIfUnsaved: boolean,
  groups: Array<Group>
|}

type DefaultProps = {
  showGroup: boolean,
  warnIfUnsaved: boolean,
  showPrev: boolean,
  groups: Array<Group>
}

type LayerSettingsState = {
  canSubmit: boolean,
  pendingChanges: boolean
}

type State = LocaleStoreState & LayerStoreState & LayerSettingsState

export default class LayerSettings extends MapHubsComponent<Props, State> {

  props: Props

  static defaultProps: DefaultProps = {
    showGroup: true,
    warnIfUnsaved: false,
    showPrev: false,
    groups: []
  }

  state: State = {
    canSubmit: false,
    pendingChanges: false,
    layer: {}
  }

  constructor(props: Props){
    super(props);
    this.stores.push(LayerStore);
  }

  componentDidMount(){
    const _this = this;
    window.onbeforeunload = function(){
      if(_this.props.warnIfUnsaved && _this.state.pendingChanges){
        return _this.__('You have not saved your edits, your changes will be lost.');
      }
    };
  }

  onFormChange = () => {
    this.setState({pendingChanges: true});
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

  onSubmit = (model: Object) => {
    const _this = this;
    model.name = Locales.formModelToLocalizedString(model, 'name');
    model.description = Locales.formModelToLocalizedString(model, 'description');
    model.source = Locales.formModelToLocalizedString(model, 'source');

    let initLayer = false;
    if(!this.state.owned_by_group_id){
      initLayer = true;
    }
    if(!model.group && this.state.owned_by_group_id){
      //editing settings on an existing layer
      model.group = this.state.owned_by_group_id;
    }else if(!model.group && this.props.groups.length === 1){
      //creating a new layer when user is only the member of a single group (not showing the group dropdown)
      model.group = this.props.groups[0].group_id;
    }
    if(!model.private){
      model.private = false;
    }

    LayerActions.saveSettings(model, _this.state._csrf, initLayer, (err) => {
      if(err){
        MessageActions.showMessage({title: _this.__('Error'), message: err});
      }else{
        _this.setState({pendingChanges: false});
        _this.props.onSubmit();
      }
    });
  }

  onPrev = () => {
    if(this.props.onPrev) this.props.onPrev();
  }

	render() {

    if(this.props.showGroup && (!this.props.groups || this.props.groups.length === 0)){
      return (
        <div className="container">
          <div className="row">
            <h5>{this.__('Please Join a Group')}</h5>
            <p>{this.__('Please create or join a group before creating a layer.')}</p>
          </div>
        </div>
      );
    }
    let canChangeGroup = true;
    if(this.state.status === 'published'){
      canChangeGroup = false;
    }

   
    
    const licenseOptions = Licenses.getLicenses(this.__);


    let prevButton = '', submitIcon = '';
    if(this.props.showPrev){
      prevButton = (
        <div className="left">
          <a className="waves-effect waves-light btn" onClick={this.onPrev}><i className="material-icons left">arrow_back</i>{this.props.prevText}</a>
        </div>
      );

      submitIcon = (
        <i className="material-icons right">arrow_forward</i>
      );
    }

    const license = this.state.license ? this.state.license : 'none';

     let selectGroup = '';
    if(this.props.showGroup){
      selectGroup = (
        <div  className="row">
          <SelectGroup groups={this.props.groups} type="layer" canChangeGroup={canChangeGroup} editing={!canChangeGroup}/>
        </div>
      );
    }

		return (
        <div style={{marginRight: '2%', marginLeft: '2%', marginTop:'10px'}}>
            <Formsy onValidSubmit={this.onSubmit} onChange={this.onFormChange} onValid={this.onValid} onInvalid={this.onInValid}>
              <div className="row">
              <div className="col s12 m6">
                <div className="row">
                  <MultiTextInput name="name" id ="layer-name"
                  label={{
                    en: 'Name', fr: 'Nom', es: 'Nombre', it: 'Nome'
                  }}
                 className="col s12"
                      value={this.state.name}
                      validations="maxLength:100" validationErrors={{
                        maxLength: this.__('Name must be 100 characters or less.')
                      }} length={100}
                      dataPosition="top" dataTooltip={this.__('Short Descriptive Name for the Layer')}
                      required/>
                </div>
                <div className="row">
                  <MultiTextArea name="description" 
                    label={{
                      en: 'Description',
                      fr: 'Description',
                      es: 'Descripción',
                      it: 'Descrizione'
                    }} 
                    className="col s12"
                      value={this.state.description}
                      validations="maxLength:1000" validationErrors={{
                        maxLength: this.__('Description must be 1000 characters or less.')
                      }} length={1000}
                      dataPosition="top" dataTooltip={this.__('Brief Description of the Layer')}
                      required/>
                </div>             
                {selectGroup}
              </div>
              <div className="col s12 m6">
              <div className="row">
                <MultiTextInput name="source" id="layer-source" label={{
                  en: 'Source', fr: 'Source', es: 'Source', it: 'Source'
                }}  className="col s12"
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
                    className="col s12"
                    dataPosition="top" dataTooltip={this.__('Layer License')}
                    required
                    />
                </div>
              </div>
            </div>
            <div className="container">
              {prevButton}
              <div className="right">
                  <button type="submit" className="waves-effect waves-light btn" disabled={!this.state.canSubmit}>{submitIcon}{this.props.submitText}</button>
              </div>
            </div>
            
           
          </Formsy>

      </div>
		);
	}
}