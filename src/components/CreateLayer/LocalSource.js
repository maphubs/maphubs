
var React = require('react');
var ReactDOM = require('react-dom');
var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);

var $ = require('jquery');
var classNames = require('classnames');

var Formsy = require('formsy-react');
var Radio = require('../forms/radio');
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

var LocalSource = React.createClass({

  mixins:[StateMixin.connect(LayerStore), StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    onSubmit: React.PropTypes.func.isRequired,
    active: React.PropTypes.bool.isRequired,
    showPrev: React.PropTypes.bool,
    onPrev: React.PropTypes.func
  },


  getDefaultProps() {
    return {
      onSubmit: null,
      active: false
    };
  },

  getInitialState() {
    return {
      canSubmit: false,
      selectedSource: 'local',
      geoJSON: null,
      selectedOption: 'upload',
      selectedDataType: 'point',
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
    if(this.state.selectedOption == 'empty'){
      data.is_empty = true;
      data.empty_data_type = this.state.selectedDataType;
    }
    LayerActions.saveDataSettings(data,function(err){
      if (err){
        MessageActions.showMessage({title: _this.__('Error'), message: err});
      }else{
        PresetActions.setLayerId(_this.state.layer.layer_id);
        NotificationActions.showNotification({message: _this.__('Layer Saved'), dismissAfter: 1000, onDismiss: _this.props.onSubmit});
      }
    });
  },

  sourceChange(value){
    this.setState({selectedSource: value});
  },

  dataTypeChange(value){
    this.setState({selectedDataType: value});
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
    LayerActions.finishUpload(shapefileName, function(err, result){
      if(result.success){
        _this.setState({geoJSON: result.geoJSON, canSubmit: true, multipleShapefiles: null});
        PresetActions.setImportedTags(result.uniqueProps);
        LayerActions.setDataType(result.data_type);
      } else {
        MessageActions.showMessage({title: _this.__('Error'), message: result.error});
      }
    });
  },

  optionChange(value){
    this.setState({selectedOption: value});
  },

  onProcessingStart(){
    this.setState({processing: true});
  },



	render() {

    var uploadOptions = [
      {value: 'upload', label: this.__('Upload File')},
      {value: 'empty', label: this.__("Empty (You will create new data through the editing tools or API)")}

    ];

    var emptyOption=false, uploadOption=false;
    switch(this.state.selectedOption){
      case 'empty':
        emptyOption = true;
        break;
      case 'upload':
        uploadOption = true;
        break;
      default:
      break;
    }

    //hide if not active
    var className = classNames('row');
    if(!this.props.active) {
      className = classNames('row', 'hidden');
    }

    var prevButton = '';
    if(this.props.showPrev){
      prevButton = (
        <div className="left">
          <a className="waves-effect waves-light btn" onClick={this.onPrev}><i className="material-icons left">arrow_back</i>{this.__('Previous Step')}</a>
        </div>
      );
    }
    var emptyLayer='';
    if(emptyOption){
    var typeOptions = [
      {value: 'point', label: this.__('Point')},
      {value: 'line', label: this.__('Line')},
      {value: 'polygon', label: this.__('Polygon')}
    ];

    emptyLayer=(
      <div className="row">
        <h5 style={{marginLeft: '0.5rem'}}>3) {this.__('Choose Data Type')}</h5>
        <Formsy.Form onValid={this.enableButton} onInvalid={this.disableButton}>
          <Radio name="emptydatatype" label=""onChange={this.dataTypeChange} defaultValue="point" options={typeOptions} className="col s4"
              dataPosition="right" dataTooltip={this.__('Spatial Data Type')}
            />
        </Formsy.Form>
      </div>

    );
    }

    var fileUpload ='';
    if(uploadOption){
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

      fileUpload=(
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
      );
    }

		return (
        <div className={className}>
        <Progress id="upload-process-progess" title={this.__('Processing Data')} subTitle="" dismissible={false} show={this.state.processing}/>       
          <Formsy.Form>
            <h5>2) {this.__('Choose an Option')}</h5>
            <div  className="row">
              <Radio name="type" label=""
                  defaultValue={this.state.selectedOption}
                  options={uploadOptions} onChange={this.optionChange}
                  className="col s10"
                />
            </div>
            <hr />
          </Formsy.Form>

            {emptyLayer}
            {fileUpload}
            {prevButton}
            <div className="right">
              <button className="waves-effect waves-light btn" disabled={!this.state.canSubmit} onClick={this.onSubmit}><i className="material-icons right">arrow_forward</i>{this.__('Save and Continue')}</button>
            </div>
      </div>
		);
	}
});

module.exports = LocalSource;
