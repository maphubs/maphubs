var React = require('react');
var Formsy = require('formsy-react');
var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);

var TextInput = require('../forms/textInput');
var Radio = require('../forms/radio');

var classNames = require('classnames');
var LayerActions = require('../../actions/LayerActions');
var PresetActions = require('../../actions/presetActions');
var NotificationActions = require('../../actions/NotificationActions');
var MessageActions = require('../../actions/MessageActions');

var LayerStore = require('../../stores/layer-store');
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');

var MapboxSource = React.createClass({

  mixins:[StateMixin.connect(LayerStore),StateMixin.connect(LocaleStore)],

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

  componentWillMount(){
    Formsy.addValidationRule('isValidMapboxStyleURL', function (values, value) {
        return value.startsWith('mapbox://styles/');
    });

    Formsy.addValidationRule('isValidMapboxMapID', function (values, value) {
        var valArr = value.split('.');
        return valArr && Array.isArray(valArr) && valArr.length == 2;
    });
  },

  getInitialState() {
    return {
      canSubmit: false,
      selectedOption: 'style'
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
    LayerActions.saveDataSettings(dataSettings, _this.state._csrf, function(err){
      if (err){
        MessageActions.showMessage({title: _this.__('Error'), message: err});
      }else{
        PresetActions.setLayerId(_this.state.layer.layer_id);
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
  },

  optionChange(value){
    this.setState({selectedOption: value});
  },

  onPrev() {
    if(this.props.onPrev) this.props.onPrev();
  },

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
        <div className={className}>
          <Formsy.Form>
            <h5>2) {this.__('Choose an Option')}</h5>
            <div  className="row">
              <Radio name="type" label=""
                  defaultValue={this.state.selectedOption}
                  options={mapboxOptions} onChange={this.optionChange}
                  className="col s10"
                />
            </div>
            <hr />
          </Formsy.Form>
          <Formsy.Form onValidSubmit={this.submit} onValid={this.enableButton} onInvalid={this.disableButton}>
            {styleForm}
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

module.exports = MapboxSource;
