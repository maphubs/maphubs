
import React from 'react';
import PropTypes from 'prop-types';
var ReactDOM = require('react-dom');
var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);

var $ = require('jquery');
var FileUpload = require('../forms/FileUpload');
var Map = require('../Map/Map');
var NotificationActions = require('../../actions/NotificationActions');
var LayerStore = require('../../stores/layer-store');
var PresetActions = require('../../actions/presetActions');
var LayerActions = require('../../actions/LayerActions');
var MessageActions = require('../../actions/MessageActions');
var RadioModal = require('../RadioModal');
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');

import Progress from '../Progress';

var UploadLocalSource = React.createClass({

  mixins:[StateMixin.connect(LayerStore), StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    onSubmit: PropTypes.func.isRequired,
    showPrev: PropTypes.bool,
    onPrev: PropTypes.func
  },


  getDefaultProps() {
    return {
      onSubmit: null
    };
  },

  getInitialState() {
    return {
      canSubmit: false,
      geoJSON: null,
      largeData: false,
      processing: false
    };
  },

  componentDidMount() {
    $('select').material_select();
  },

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
  },

  enableButton () {
      this.setState({
        canSubmit: true
      });
    },
    disableButton () {
      this.setState({
        canSubmit: false
      });
    },

  onSubmit(){
    var _this = this;
    var data = {
      is_external: false,
      external_layer_type: '',
      external_layer_config: {}
    };

    LayerActions.saveDataSettings(data, _this.state._csrf, function(err){
      if (err){
        MessageActions.showMessage({title: _this.__('Error'), message: err});
      }else{
        PresetActions.setLayerId(_this.state.layer.layer_id);
        NotificationActions.showNotification({message: _this.__('Layer Saved'), dismissAfter: 1000, onDismiss: _this.props.onSubmit});
      }
    });
  },

  onPrev() {
    if(this.props.onPrev) this.props.onPrev();
  },

  onUpload(result){
    var _this = this;
    
    if(result.success){
      this.setState({geoJSON: result.geoJSON, canSubmit: true, largeData: result.largeData});
      PresetActions.setImportedTags(result.uniqueProps);
      LayerActions.setDataType(result.data_type);
    }else{
      if(result.code == 'MULTIPLESHP'){
        this.setState({multipleShapefiles: result.value});
      }else{
        MessageActions.showMessage({title: _this.__('Error'), message: result.error});
      }
    }
    this.setState({processing: false});
  },

  onUploadError(err){
      MessageActions.showMessage({title: this.__('Error'), message: err});
  },


  finishUpload(shapefileName){
    var _this = this;
    LayerActions.finishUpload(shapefileName, this.state._csrf, function(err, result){
      if(result.success){
        _this.setState({geoJSON: result.geoJSON, canSubmit: true, multipleShapefiles: null});
        PresetActions.setImportedTags(result.uniqueProps);
        LayerActions.setDataType(result.data_type);
      } else {
        MessageActions.showMessage({title: _this.__('Error'), message: result.error});
      }
    });
  },

  onProcessingStart(){
    this.setState({processing: true});
  },

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
      this.state.multipleShapefiles.forEach(function(shpFile){
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
});

module.exports = UploadLocalSource;
