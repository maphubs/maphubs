var React = require('react');
var Formsy = require('formsy-react');
var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);

var TextInput = require('../forms/textInput');
var PresetActions = require('../../actions/presetActions');
var LayerActions = require('../../actions/LayerActions');
var NotificationActions = require('../../actions/NotificationActions');
var MessageActions = require('../../actions/MessageActions');
var Radio = require('../forms/radio');
var LayerStore = require('../../stores/layer-store');
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');

var GeoJSONUrlSource = React.createClass({

  mixins:[StateMixin.connect(LayerStore), StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    onSubmit: React.PropTypes.func.isRequired,
    showPrev: React.PropTypes.bool,
    onPrev: React.PropTypes.func
  },

  getDefaultProps() {
    return {
      onSubmit: null
    };
  },

  getInitialState() {
    return {
      canSubmit: false
    };
  },

  componentWillMount(){
    Formsy.addValidationRule('isHttps', function (values, value) {
        return value.startsWith('https://');
    });
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

    LayerActions.saveDataSettings({
      is_external: true,
      external_layer_type: 'GeoJSON',
      external_layer_config: {
        type: 'geojson',
        id: model.id,
        data_type: model.data_type,
        data: model.geojsonUrl
      }
    }, _this.state._csrf, function(err){
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

  sourceChange(value){
    this.setState({selectedSource: value});
  },

  onPrev() {
    if(this.props.onPrev) this.props.onPrev();
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
});

module.exports = GeoJSONUrlSource;
