//@flow
import React from 'react';
import Formsy, {addValidationRule} from 'formsy-react';
import TextInput from '../forms/textInput';
import Radio from '../forms/radio';
import LayerActions from '../../actions/LayerActions';
import NotificationActions from '../../actions/NotificationActions';
import MessageActions from '../../actions/MessageActions';
import LayerStore from '../../stores/layer-store';
import MapHubsComponent from '../MapHubsComponent';
import type {LocaleStoreState} from '../../stores/LocaleStore';
import type {LayerStoreState} from '../../stores/layer-store';

type Props = {|
  onSubmit: Function,
  showPrev: boolean,
  onPrev: Function
|}

type State = {
  canSubmit: boolean,
  selectedOption: string
} & LocaleStoreState & LayerStoreState;


export default class MapboxSource extends MapHubsComponent<Props, State> {

  props: Props

  state: State = {
    canSubmit: false,
    selectedOption: 'style'
  }

  constructor(props: Props){
    super(props);
    this.stores.push(LayerStore);
  }

  componentWillMount(){
    super.componentWillMount();
    addValidationRule('isValidMapboxStyleURL', (values, value) => {
      if(value){
        return value.startsWith('mapbox://styles/');
      }else{
        return false;
      }
    });

    addValidationRule('isValidMapboxMapID', (values, value) => {
      if(value){
        var valArr = value.split('.');
        return valArr && Array.isArray(valArr) && valArr.length === 2;
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
    if(model.mapboxStyleID){
      var mapboxStyleID = model.mapboxStyleID.replace(/mapbox:\/\/styles\//i, '');
      dataSettings = {
        is_external: true,
        external_layer_type: 'mapbox-style',
        external_layer_config: {
          type: 'mapbox-style',
          mapboxid: mapboxStyleID
        }
      };
    }else if(model.mapboxMapID){
      var mapboxMapID = model.mapboxMapID;
      dataSettings = {
        is_external: true,
        external_layer_type: 'mapbox-map',
        external_layer_config: {
          "url": "mapbox://"+mapboxMapID,
          "type": "raster",
          "tileSize": 256
        }
      };
    }
    LayerActions.saveDataSettings(dataSettings, _this.state._csrf, (err) => {
      if (err){
        MessageActions.showMessage({title: _this.__('Error'), message: err});
      }else{
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

    var mapboxOptions = [
      {value: 'style', label: this.__('Link to a complete Mapbox Studio Style')},
      {value: 'tiles', label: this.__("Link to Mapbox Data/Raster Tiles")}
    ];

    var styleOption=false, tilesOption=false;
    switch(this.state.selectedOption){
      case 'style':
        styleOption = true;
        break;
      case 'tiles':
        tilesOption = true;
        break;
      default:
      break;
    }

    var prevButton = '';
    if(this.props.showPrev){
      prevButton = (
        <div className="left">
          <a className="waves-effect waves-light btn" onClick={this.onPrev}><i className="material-icons left">arrow_back</i>{this.__('Previous Step')}</a>
        </div>
      );
    }

    var styleForm = '';
    if(styleOption){
      styleForm = (
        <div>
          <p>{this.__('Mapbox Style Source')}</p>
          <div className="row">
            <TextInput name="mapboxStyleID" label={this.__('Mapbox Style URL')} icon="info" className="col s12" validations={{isValidMapboxStyleURL:true}} validationErrors={{
                   isValidMapboxStyleURL: this.__('Invalid Mapbox Style URL, must be in the format mapbox://styles/...')
               }} length={100}
              dataPosition="top" dataTooltip={this.__('Mapbox Style URL in the format mapbox://styles/...')}
               required/>
          </div>
        </div>
      );
    }
    var tilesForm = '';
    if(tilesOption){
      tilesForm = (
        <div>
          <p>{this.__('Mapbox Tileset/Raster Source')}</p>
          <div className="row">
            <TextInput name="mapboxMapID" label={this.__('Mapbox Tileset Map ID')} icon="info" className="col s12"
               validations={{isValidMapboxMapID:true}} validationErrors={{
                   isValidMapboxMapID: this.__('Invalid Mapbox Map ID, should be in the format accountname.mapid')
               }} length={100}
              dataPosition="top" dataTooltip={this.__('Mapbox Map ID')}
               required/>
          </div>
        </div>

      );
    }

		return (
        <div className="row">
          <Formsy>
            <b>{this.__('Choose an Option')}</b>
            <div  className="row">
              <Radio name="type" label=""
                  defaultValue={this.state.selectedOption}
                  options={mapboxOptions} onChange={this.optionChange}
                  className="col s10"
                />
            </div>
            <hr />
          </Formsy>
          <Formsy onValidSubmit={this.submit} onValid={this.enableButton} onInvalid={this.disableButton}>
            {styleForm}
            {tilesForm}
            {prevButton}
            <div className="right">
              <button type="submit" className="waves-effect waves-light btn" disabled={!this.state.canSubmit}><i className="material-icons right">arrow_forward</i>{this.__('Save and Continue')}</button>
            </div>
          </Formsy>

      </div>
		);
	}
}