//@flow
import React from 'react';
import Formsy from 'formsy-react';
import TextInput from '../forms/textInput';
import Radio from '../forms/radio';
import PresetActions from '../../actions/presetActions';
import LayerActions from '../../actions/LayerActions';
import NotificationActions from '../../actions/NotificationActions';
import MessageActions from '../../actions/MessageActions';
import LayerStore from '../../stores/layer-store';
import MapHubsComponent from '../MapHubsComponent';

import type {LocaleStoreState} from '../../stores/LocaleStore';
import type {LayerStoreState} from '../../stores/layer-store';

type Props = {
  onSubmit: Function,
  showPrev: boolean,
  onPrev: Function
}

type State = {
  canSubmit: boolean,
  selectedOption: string
} & LocaleStoreState & LayerStoreState

export default class AGOLSource extends MapHubsComponent<void, Props, State> {

  props: Props

  state: State = {
    canSubmit: false,
    selectedOption: 'mapserverquery'
  }

  constructor(props: Props){
    super(props);
    this.stores.push(LayerStore);
  }

  componentWillMount(){
    super.componentWillMount();
    Formsy.addValidationRule('isHttps', (values, value) => {
      if(value){
        return value.startsWith('https://');
      }else{
        return false;
      }   
    });
  }

  enableButton = () => {
    this.setState({
      canSubmit: true
    });
  }

  disableButton = () => {
    this.setState({
      canSubmit: false
    });
  }

  submit = (model: Object) => {
    var _this = this;
    var dataSettings = null;
    if(model.mapServiceUrl){
      dataSettings = {
        is_external: true,
        external_layer_type: 'ArcGIS MapServer Query',
        external_layer_config: {
          type: 'ags-mapserver-query',
          url: model.mapServiceUrl
        }
      };
    }else if(model.featureServiceUrl){
      dataSettings = {
        is_external: true,
        external_layer_type: 'ArcGIS FeatureServer Query',
        external_layer_config: {
          type: 'ags-featureserver-query',
          url: model.featureServiceUrl
        }
      };
    }else if(model.tileServiceUrl){
      dataSettings = {
        is_external: true,
        external_layer_type: 'ArcGIS MapServer Tiles',
        external_layer_config: {
          type: 'ags-mapserver-tiles',
          url: model.tileServiceUrl
        }
      };
    }
    LayerActions.saveDataSettings(dataSettings, _this.state._csrf, (err) => {
      if (err){
        MessageActions.showMessage({title: _this.__('Error'), message: err});
      }else{
        PresetActions.setLayerId(_this.state.layer_id);
        NotificationActions.showNotification({
          message: _this.__('Layer Saved'),
          dismissAfter: 1000,
          onDismiss(){
            //reset style to load correct source
            LayerActions.resetStyle();
            //tell the map that the data is initialized
            LayerActions.tileServiceInitialized();
            _this.props.onSubmit();
          }
        });
      }

    });
  }

  optionChange = (value: string) => {
    this.setState({selectedOption: value});
  }

  onPrev = () => {
    if(this.props.onPrev) this.props.onPrev();
  }

	render() {
    var agolOptions = [
      {value: 'mapserverquery', label: this.__('Link to a MapServer Query Service')},
      {value: 'featureserverquery', label: this.__("Link to a FeatureServer Query Service")},
      {value: 'mapservertiles', label: this.__("Link to a MapServer Tile Service")}
    ];

    var msqOption=false, fsqOption=false, tilesOption=false;
    switch(this.state.selectedOption){
      case 'mapserverquery':
        msqOption = true;
        break;
        case 'featureserverquery':
          fsqOption = true;
          break;
      case 'mapservertiles':
          tilesOption = true;
          break;
      default:
      break;
    }

    var msqForm = '';
    if(msqOption){
      msqForm = (
        <div>
          <p>{this.__('ArcGIS MapServer Query Source')}</p>
          <div className="row">
            <TextInput name="mapServiceUrl" label={this.__('Map Service URL')} icon="info" className="col s12" validations="maxLength:250,isHttps" validationErrors={{
                   maxLength: this.__('Must be 250 characters or less.'),
                   isHttps:  this.__('SSL required for external links, URLs must start with https://')
               }} length={250}
               dataPosition="top" dataTooltip={this.__('Map Service URL: ex: http://myserver/arcgis/rest/services/MyMap/MapServer/0')}
               required/>
          </div>
        </div>
      );
    }

    var fsqForm = '';
    if(fsqOption){
      fsqForm = (
        <div>
          <p>{this.__('ArcGIS FeatureService Query Source')}</p>
          <div className="row">
            <TextInput name="featureServiceUrl" label={this.__('Feature Service URL')} icon="info" className="col s12" validations="maxLength:250,isHttps" validationErrors={{
                   maxLength: this.__('Must be 250 characters or less.'),
                   isHttps:  this.__('SSL required for external links, URLs must start with https://')
               }} length={250}
               dataPosition="top" dataTooltip={this.__('Feature Service URL ex: http://myserver/arcgis/rest/services/MyMap/FeatureServer/0')}
               required/>
          </div>
        </div>
      );
    }

    var tilesForm = '';
    if(tilesOption){
      tilesForm = (
        <div>
          <p>{this.__('ArcGIS MapServer Tiles')}</p>
          <div className="row">
            <TextInput name="tileServiceUrl" label={this.__('MapServer Service URL')} icon="info" className="col s12" validations="maxLength:250,isHttps" validationErrors={{
                   maxLength: this.__('Must be 250 characters or less.'),
                   isHttps:  this.__('SSL required for external links, URLs must start with https://')
               }} length={250}
               dataPosition="top" dataTooltip={this.__('MapServer URL ex: http://myserver/arcgis/rest/services/MyMap/MapServer')}
               required/>
          </div>
        </div>
      );
    }

    var prevButton = '';
    if(this.props.showPrev){
      prevButton = (
        <div className="left">
          <a className="waves-effect waves-light btn" onClick={this.onPrev}><i className="material-icons left">arrow_back</i>{this.__('Previous Step')}</a>
        </div>
      );
    }

		return (
        <div className="row">
          <Formsy.Form>
            <b>{this.__('Choose an Option')}</b>
            <div  className="row">
              <Radio name="type" label=""
                  defaultValue={this.state.selectedOption}
                  options={agolOptions} onChange={this.optionChange}
                  className="col s10"
                />
            </div>
            <hr />
          </Formsy.Form>
          <Formsy.Form onValidSubmit={this.submit} onValid={this.enableButton} onInvalid={this.disableButton}>
            {msqForm}
            {fsqForm}
            {tilesForm}
            {prevButton}
            <div className="right">
              <button type="submit" className="waves-effect waves-light btn" disabled={!this.state.canSubmit}><i className="material-icons right">arrow_forward</i>{this.__('Save and Continue')}</button>
            </div>
          </Formsy.Form>
      </div>
		);
	}
}