//@flow
import React from 'react';
import Formsy from 'formsy-react';
import TextInput from '../forms/textInput';
import PresetActions from '../../actions/presetActions';
import LayerActions from '../../actions/LayerActions';
import NotificationActions from '../../actions/NotificationActions';
import MessageActions from '../../actions/MessageActions';
import Radio from '../forms/radio';
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
  canSubmit: boolean
} & LocaleStoreState & LayerStoreState

export default class GeoJSONUrlSource extends MapHubsComponent<void, Props, State> {

  props: Props

  state: State = {
    canSubmit: false
  }

  constructor(props: Object){
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

    LayerActions.saveDataSettings({
      is_external: true,
      external_layer_type: 'GeoJSON',
      external_layer_config: {
        type: 'geojson',
        id: model.id,
        data_type: model.data_type,
        data: model.geojsonUrl
      }
    }, _this.state._csrf, (err) => {
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

  sourceChange = (value: string) => {
    this.setState({selectedSource: value});
  }

  onPrev = () => {
    if(this.props.onPrev) this.props.onPrev();
  }

	render() {

    var prevButton = '';
    if(this.props.showPrev){
      prevButton = (
        <div className="left">
          <a className="waves-effect waves-light btn" onClick={this.onPrev}><i className="material-icons left">arrow_back</i>{this.__('Previous Step')}</a>
        </div>
      );
    }

    var dataTypeOptions = [
      {value: 'point', label: this.__('Point')},
      {value: 'line', label: this.__("Line")},
      {value: 'polygon', label: this.__("Polygon")}
    ];

		return (
        <div className="row">
          <Formsy.Form onValidSubmit={this.submit} onValid={this.enableButton} onInvalid={this.disableButton}>

            <div>
              <p>{this.__('GeoJSON URL')}</p>
            <div className="row">
              <TextInput name="geojsonUrl" label={this.__('GeoJSON URL')} icon="info" className="col s12" validations="maxLength:500,isHttps" validationErrors={{
                     maxLength: this.__('Must be 500 characters or less.'),
                     isHttps:  this.__('SSL required for external links, URLs must start with https://')
                 }} length={500}
                 dataPosition="top" dataTooltip={this.__('Vector Tile URL for example:') +'http://myserver/tiles/{z}/{x}/{y}.pbf'}
                 required/>
            </div>
            <div className="row">
              <TextInput name="id" label={this.__('ID Property (Optional)')} icon="info" className="col s12" 
                 dataPosition="top" dataTooltip={this.__('Some features require idenify a unique identifier that can be used to select features')}
                 required/>
            </div>  
            <div  className="row">
              <Radio name="data_type" label=""
                  defaultValue="point"
                  options={dataTypeOptions}
                  className="col s10"
                />
            </div>
          </div>

            {prevButton}
            <div className="right">
              <button type="submit" className="waves-effect waves-light btn" disabled={!this.state.canSubmit}><i className="material-icons right">arrow_forward</i>{this.__('Save and Continue')}</button>
            </div>
          </Formsy.Form>

      </div>
		);
	}
}