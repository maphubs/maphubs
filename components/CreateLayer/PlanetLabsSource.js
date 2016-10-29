var React = require('react');
var Formsy = require('formsy-react');
var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);

var Radio = require('../forms/radio');
var TextInput = require('../forms/textInput');
var PresetActions = require('../../actions/presetActions');
var LayerActions = require('../../actions/LayerActions');
var NotificationActions = require('../../actions/NotificationActions');
var MessageActions = require('../../actions/MessageActions');

var LayerStore = require('../../stores/layer-store');
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');

var classNames = require('classnames');

var PlanetLabsSource = React.createClass({

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
      selectedOption: 'scene',
      selectedSceneOption: 'ortho'
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

    //build planet labs API URL

    //https://tiles.planet.com/v0/scenes/ortho/20160909_175231_0c75/{z}/{x}/{y}.png?api_key=9f988728129f45ea9a939b7041686e89
    var url = "https://tiles.planet.com";

    if(this.state.selectedOption == 'scene'){
      url += '/v0/scenes/' + this.state.selectedSceneOption + '/' + model.planetScene;

    }else if(this.state.selectedOption == 'mosaic'){
      url += '/v0/mosaics/' + model.planetMosaic;
    }
    url += '/{z}/{x}/{y}.png?api_key=' + MAPHUBS_CONFIG.PLANET_LABS_API_KEY;

    LayerActions.saveDataSettings({
      is_external: true,
      external_layer_type: 'Planet Labs',
      external_layer_config: {
        type: 'raster',
        planet_labs_scene: model.scene,
        planet_labs_mosaic: model.mosaic,
        tiles: [url]
      }
    },function(err){
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

  sceneOptionChange(value){
    this.setState({selectedSceneOption: value});
  },

  onPrev() {
    if(this.props.onPrev) this.props.onPrev();
  },

	render() {

    var planetLabsOptions = [
      {value: 'scene', label: this.__('Link to a Planet Labs Scene')},
      {value: 'mosaic', label: this.__("Link to a Planet Labs Mosaic")}
    ];

    var planetSceneOptions = [
      {value: 'ortho', label: this.__('Ortho')},
      {value: 'rapideye', label: this.__("RapidEye")},
      {value: 'landsat', label: this.__("Landsat")}
    ];


    var form = '';
    if(this.state.selectedOption == 'scene'){
      form = (
        <div>
          <p>{this.__('Planet Labs Scene: ')}<a href="https://www.planet.com/docs/referencev0/scenes/" target="_blank">https://www.planet.com/docs/referencev0/scenes/</a></p>
            <div  className="row">
              <Radio name="type" label=""
                  defaultValue={this.state.selectedSceneOption}
                  options={planetSceneOptions} onChange={this.sceneOptionChange}
                  className="col s10"
                />
            </div>
          <div className="row">
            <TextInput name="planetScene" label={this.__('Planet Labs Scene ID')}
              validations="maxLength:250" validationErrors={{
                     maxLength: this.__('Must be 250 characters or less.')
                 }} length={250}
               dataPosition="top" dataTooltip={this.__('Copy and Paste from the Planet Scene Browser')}

              icon="info" className="col s12"required/>
          </div>
        </div>
      );
    }else if(this.state.selectedOption == 'mosaic'){
      form = (
        <div>
          <p>{this.__('Planet Labs Mosaic: ')}<a href="https://www.planet.com/docs/referencev0/scenes/" target="_blank">https://www.planet.com/docs/referencev0/scenes/</a></p>
          <div className="row">
            <TextInput name="planetMosaic"
              label={this.__('Planet Labs Mosaic ID')}
              validations="maxLength:250" validationErrors={{
                     maxLength: this.__('Must be 250 characters or less.')
                 }} length={250}
               dataPosition="top" dataTooltip={this.__('Extract from browser URL in Mosaic Browser')}
              icon="info" className="col s12" required/>
          </div>
        </div>
      );
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

		return (
        <div className={className}>
          <Formsy.Form>
            <h5>2) {this.__('Choose an Option')}</h5>
            <div  className="row">
              <Radio name="type" label=""
                  defaultValue={this.state.selectedOption}
                  options={planetLabsOptions} onChange={this.optionChange}
                  className="col s10"
                />
            </div>
            <hr />
          </Formsy.Form>

          <Formsy.Form onValidSubmit={this.submit} onValid={this.enableButton} onInvalid={this.disableButton}>
            {form}
            {prevButton}
            <div className="right">
              <button type="submit" className="waves-effect waves-light btn" disabled={!this.state.canSubmit}><i className="material-icons right">arrow_forward</i>{this.__('Save and Continue')}</button>
            </div>
          </Formsy.Form>

      </div>
		);
	}
});

module.exports = PlanetLabsSource;
