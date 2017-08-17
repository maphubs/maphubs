//@flow
import React from 'react';
var $ = require('jquery');
import FileUpload from '../forms/FileUpload';
import Map from '../Map/Map';
import NotificationActions from '../../actions/NotificationActions';
import LayerStore from '../../stores/layer-store';
import LayerActions from '../../actions/LayerActions';
import MessageActions from '../../actions/MessageActions';
import RadioModal from '../RadioModal';
import Progress from '../Progress';
import MapHubsComponent from '../MapHubsComponent';
import type {LocaleStoreState} from '../../stores/LocaleStore';
import type {LayerStoreState} from '../../stores/layer-store';
import type {GeoJSONObject} from 'geojson-flow';

type Props = {|
  onSubmit: Function,
  showPrev: boolean,
  onPrev: Function,
  layerDataType: string,
  mapConfig: Object
|}

type State = {
  canSubmit: boolean,
  geoJSON?: GeoJSONObject,
  largeData: boolean,
  processing: boolean,
  multipleShapefiles: any
} & LocaleStoreState & LayerStoreState

export default class UploadLayerReplacement extends MapHubsComponent<Props, State> {

  props: Props

  state: State = {
    canSubmit: false,
    largeData: false,
    processing: false,
    multipleShapefiles: null,
    layer: {}
  }

  constructor(props: Props){
    super(props);
    this.stores.push(LayerStore);
  }

  componentDidMount() {
    $('select').material_select();
  }

  componentDidUpdate() {
    if(this.state.geoJSON){
      var scrollTarget = $(this.refs.map);
      $('html,body').animate({
         scrollTop: scrollTarget.offset().top
       }, 1000);
    }
    if(this.state.multipleShapefiles){
      this.refs.chooseshape.show();
    }
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

  onSubmit = () => {
    var _this = this;
    var data = {
      is_external: false,
      external_layer_type: '',
      external_layer_config: {}
    };

    LayerActions.saveDataSettings(data, _this.state._csrf, (err) => {
      if (err){
        MessageActions.showMessage({title: _this.__('Error'), message: err});
      }else{
        NotificationActions.showNotification({message: _this.__('Layer Saved'), dismissAfter: 1000, onDismiss: _this.props.onSubmit});
      }
    });
  }

  onPrev = () => {
    if(this.props.onPrev) this.props.onPrev();
  }

  onUpload = (result: Object) => {
    var _this = this;
    
    if(result.success){
      this.setState({geoJSON: result.geoJSON, canSubmit: true, largeData: result.largeData});      
      //LayerActions.setDataType(result.data_type);
      //LayerActions.setImportedTags(result.uniqueProps,  true);
    }else{
      if(result.code === 'MULTIPLESHP'){
        this.setState({multipleShapefiles: result.shapefiles});
      }else{
        MessageActions.showMessage({title: _this.__('Error'), message: result.error});
      }
    }
    this.setState({processing: false});
  }

  onUploadError = (err: string) => {
      MessageActions.showMessage({title: this.__('Error'), message: err});
  }

  finishUpload = (shapefileName: string) => {
    var _this = this;
    LayerActions.finishUpload(shapefileName, this.state._csrf, (err, result) => {
      if(result.success){
        _this.setState({geoJSON: result.geoJSON, canSubmit: true, multipleShapefiles: null});
        LayerActions.setDataType(result.data_type);
        LayerActions.setImportedTags(result.uniqueProps, true);    
      } else {
        MessageActions.showMessage({title: _this.__('Error'), message: result.error});
      }
    });
  }

  onProcessingStart = () => {
    this.setState({processing: true});
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

    let layer_id = this.state.layer_id ? this.state.layer_id : 0;
    let url = `/api/layer/${layer_id}/upload`;
    var largeDataMessage = '';
    if(this.state.largeData){
      largeDataMessage = (
      <p>{this.__('Data Uploaded Successfully. Large dataset detected, you will be able to preview the data in Step 5 after it is loaded.')}</p>
      );
    }
    var map = '';
    if(this.state.geoJSON){
      map = (
        <div>
          <p>{this.__('Please review the data on the map to confirm the upload was successful.')}</p>
          <Map ref="map" style={{width: '100%', height: '400px'}} 
          id="upload-preview-map"
          showFeatureInfoEditButtons={false} 
          mapConfig={this.props.mapConfig}
          data={this.state.geoJSON} />
        </div>
      );
    }

    var multipleShapefiles = '';
    if(this.state.multipleShapefiles){
      var options = [];
      this.state.multipleShapefiles.forEach((shpFile) => {
        options.push({value: shpFile, label: shpFile});
      });
      multipleShapefiles = (
        <RadioModal ref="chooseshape" title={this.__('Multiple Shapefiles Found - Please Select One')}
          options={options} onSubmit={this.finishUpload} />
      );
    }

		return (
        <div className="row">
        <Progress id="upload-process-progess" title={this.__('Processing Data')} subTitle="" dismissible={false} show={this.state.processing}/>       
        <div>
          <p>{this.__('Upload File: Shapefile(Zip), GeoJSON, KML, GPX (tracks or waypoints), or CSV (with Lat/Lon fields)')}</p>
          <div className="row">
            <FileUpload onUpload={this.onUpload} onFinishTx={this.onProcessingStart} onError={this.onUploadError} action={url} />
          </div>
          <div className="row">
            {largeDataMessage}
            {map}
          </div>
          {multipleShapefiles}
        </div>
        {prevButton}
        <div className="right">
          <button className="waves-effect waves-light btn" disabled={!this.state.canSubmit} onClick={this.onSubmit}><i className="material-icons right">arrow_forward</i>{this.__('Save and Continue')}</button>
        </div>
      </div>
		);
	}
}