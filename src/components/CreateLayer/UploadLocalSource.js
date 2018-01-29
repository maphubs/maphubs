//@flow
import React from 'react';
import UppyFileUpload from '../forms/UppyFileUpload';
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
import request from 'superagent';

let scrollToComponent;

type Props = {|
  onSubmit: Function,
  mapConfig: Object
|}

type State = {
  canSubmit: boolean,
  geoJSON?: GeoJSONObject,
  largeData: boolean,
  processing: boolean,
  multipleShapefiles: any
} & LocaleStoreState & LayerStoreState

export default class UploadLocalSource extends MapHubsComponent<Props, State> {

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

  componentDidMount(){
    scrollToComponent = require('react-scroll-to-component');
  }

  componentDidUpdate() {
    if(this.state.geoJSON){
      scrollToComponent(this.refs.map);
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
    const _this = this;
    const data = {
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

  onUpload = (file: Object) => {
    const _this = this;
    this.onProcessingStart();
    request.post('/api/layer/complete/upload')
        .type('json').accept('json')
        .send({
          uploadUrl: file.uploadURL,
          layer_id: this.state.layer_id,
          originalName: file.data.name
        })
        .end((err, res) => {
          if(err){
            _this.onUploadError(err);
          }else {
            const result = res.body;
            if(result.success){
              this.setState({geoJSON: result.geoJSON, canSubmit: true, largeData: result.largeData});      
              LayerActions.setDataType(result.data_type);
              LayerActions.setImportedTags(result.uniqueProps,  true);
            }else{
              if(result.code === 'MULTIPLESHP'){
                this.setState({multipleShapefiles: result.shapefiles});
              }else{
                MessageActions.showMessage({title: _this.__('Error'), message: result.error});
              }
            }
            this.setState({processing: false});
          }
        });
  }

  onUploadError = (err: string) => {
      MessageActions.showMessage({title: this.__('Error'), message: err});
  }

  finishUpload = (shapefileName: string) => {
    const _this = this;
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
    const layer_id = this.state.layer_id ? this.state.layer_id : 0;
    // const url = `/api/layer/${layer_id}/upload`;
    let largeDataMessage = '';
    if(this.state.largeData){
      largeDataMessage = (
      <p>{this.__('Data Uploaded Successfully. Large dataset detected, you will be able to preview the data in Step 5 after it is loaded.')}</p>
      );
    }
    let map = '';
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

    let multipleShapefiles = '';
    if(this.state.multipleShapefiles){
      const options = [];
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
          <div className="row">
            <div style={{margin: 'auto auto', maxWidth: '750px'}}>
              <UppyFileUpload
                endpoint="/api/layer/upload"
                note="Supported files: Shapefile (Zip), GeoJSON, KML,  GPX (tracks or waypoints), or CSV (with Lat/Lon fields), and MapHubs format"
                layer_id={layer_id}
                onProcessingStart={this.onProcessingStart}
                onComplete={this.onUpload}
                onError={this.onUploadError}
              />
            </div>
          </div>
          <div className="row">
            {largeDataMessage}
            {map}
          </div>
          {multipleShapefiles}
        </div>
        <div className="right">
          <button className="waves-effect waves-light btn" disabled={!this.state.canSubmit} onClick={this.onSubmit}><i className="material-icons right">arrow_forward</i>{this.__('Save and Continue')}</button>
        </div>
      </div>
		);
	}
}