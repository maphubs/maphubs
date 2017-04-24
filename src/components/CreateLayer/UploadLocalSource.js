//@flow
import React from 'react';
var $ = require('jquery');
import ReactDOM from 'react-dom';
import FileUpload from '../forms/FileUpload';
import Map from '../Map/Map';
import NotificationActions from '../../actions/NotificationActions';
import LayerStore from '../../stores/layer-store';
import PresetActions from '../../actions/presetActions';
import LayerActions from '../../actions/LayerActions';
import MessageActions from '../../actions/MessageActions';
import RadioModal from '../RadioModal';
import Progress from '../Progress';
import MapHubsComponent from '../MapHubsComponent';

export default class UploadLocalSource extends MapHubsComponent {

  props: {
    onSubmit: Function,
    showPrev: boolean,
    onPrev: Function
  }

  state = {
    canSubmit: false,
    geoJSON: null,
    largeData: false,
    processing: false,
    multipleShapefiles: null
  }

  constructor(props: Object){
    super(props);
    this.stores.push(LayerStore);
  }

  componentDidMount() {
    $('select').material_select();
  }

  componentDidUpdate() {
    if(this.state.geoJSON){
      var scrollTarget = $(ReactDOM.findDOMNode(this.refs.map));
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
        PresetActions.setLayerId(_this.state.layer.layer_id);
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
      PresetActions.setImportedTags(result.uniqueProps);
      LayerActions.setDataType(result.data_type);
    }else{
      if(result.code === 'MULTIPLESHP'){
        this.setState({multipleShapefiles: result.value});
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
        PresetActions.setImportedTags(result.uniqueProps);
        LayerActions.setDataType(result.data_type);
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

    
    var url = "/api/layer/" + this.state.layer.layer_id + "/upload";
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
          <Map ref="map" style={{width: '100%', height: '400px'}} showFeatureInfoEditButtons={false} data={this.state.geoJSON} />
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