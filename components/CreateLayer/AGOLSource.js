
var React = require('react');
var Formsy = require('formsy-react');
//var $ = require('jquery');
var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);

var TextInput = require('../forms/textInput');
var Radio = require('../forms/radio');
var classNames = require('classnames');
var PresetActions = require('../../actions/presetActions');
var LayerActions = require('../../actions/LayerActions');
var NotificationActions = require('../../actions/NotificationActions');
var MessageActions = require('../../actions/MessageActions');
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');

var LayerStore = require('../../stores/layer-store');

var AGOLSource = React.createClass({

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
      selectedOption: 'mapserverquery'
    };
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

  submit (model) {
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
    LayerActions.saveDataSettings(dataSettings,function(err){
      if (err){
        MessageActions.showMessage({title: _this.__('Error'), message: err});
      }else{
        PresetActions.setLayerId(_this.state.layer.layer_id);
        NotificationActions.showNotification({
          message: _this.__('Layer Saved'),
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
  },

  optionChange(value){
    this.setState({selectedOption: value});
  },

  onPrev() {
    if(this.props.onPrev) this.props.onPrev();
  },

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

    //hide if not active
    var className = classNames('row');
    if(!this.props.active) {
      className = classNames('row', 'hidden');
    }

    var msqForm = '';
    if(msqOption){
      msqForm = (
        <div>
          <p>{this.__('ArcGIS MapServer Query Source')}</p>
          <div className="row">
            <TextInput name="mapServiceUrl" label={this.__('Map Service URL')} icon="info" className="col s12" validations="maxLength:250" validationErrors={{
                   maxLength: this.__('Must be 250 characters or less.')
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
            <TextInput name="featureServiceUrl" label={this.__('Feature Service URL')} icon="info" className="col s12" validations="maxLength:250" validationErrors={{
                   maxLength: this.__('Must be 250 characters or less.')
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
            <TextInput name="tileServiceUrl" label={this.__('MapServer Service URL')} icon="info" className="col s12" validations="maxLength:250" validationErrors={{
                   maxLength: this.__('Must be 250 characters or less.')
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
        <div className={className}>
          <Formsy.Form>
            <h5>2) {this.__('Choose an Option')}</h5>
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
});

module.exports = AGOLSource;
