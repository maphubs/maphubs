import React from 'react';
import PropTypes from 'prop-types';
var Formsy = require('formsy-react');
import Reflux from 'reflux';
var StateMixin = require('reflux-state-mixin')(Reflux);

var TextArea = require('../forms/textArea');
var PresetActions = require('../../actions/presetActions');
var LayerActions = require('../../actions/LayerActions');
var NotificationActions = require('../../actions/NotificationActions');
var MessageActions = require('../../actions/MessageActions');

var LayerStore = require('../../stores/layer-store');
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');

var PlanetLabsSource = React.createClass({

  mixins:[StateMixin.connect(LayerStore), StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    onSubmit: PropTypes.func.isRequired,
    showPrev: PropTypes.bool,
    onPrev: PropTypes.func
  },

  static defaultProps: {
    return {
      onSubmit: null
    };
  },

  getInitialState() {
    return {
      canSubmit: false,
      selectedOption: 'scene',
      selectedSceneOption: 'ortho'
    };
  },

  componentWillMount(){
    Formsy.addValidationRule('isNotRapidEye', function (values, value) {
        return !value.startsWith('REOrthoTile');
    });

    Formsy.addValidationRule('isNotOrtho', function (values, value) {
        return !value.startsWith('PSOrthoTile');
    });

    Formsy.addValidationRule('isNotSentinel', function (values, value) {
        return !value.startsWith('Sentinel2L1C');
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

  getAPIUrl(selected){
    var APIType = 'ortho'; // 'rapideye', 'landsat'
    var selectedArr = selected.split(':');
    var selectedType = selectedArr[0];
    var selectedScene = selectedArr[1];
    if(selectedType === 'PSScene4Band' || selectedType === 'PSScene3Band' || selectedType === 'PSOrthoTile'){
       APIType = 'ortho';
    }else if(selectedType === 'REOrthoTile'){
      APIType = 'rapideye';
    }else if(selectedType === 'Landsat8L1G'){
      APIType = 'landsat';
    }else if(selectedType === 'Sentinel2L1C'){
      APIType = 'sentinel';
    }

    //build planet labs API URL
    //https://tiles.planet.com/v0/scenes/ortho/20160909_175231_0c75/{z}/{x}/{y}.png?api_key=9f988728129f45ea9a939b7041686e89
    var url = `https://tiles.planet.com/v0/scenes/${APIType}/${selectedScene}`;
    url += '/{z}/{x}/{y}.png?api_key=' + MAPHUBS_CONFIG.PLANET_LABS_API_KEY;
    return url;
  },

  submit (model) {
    var _this = this;
    var layers = [];

    var selectedIDs = model.selectedIDs;

    var selectedIDArr = selectedIDs.split(',');

    selectedIDArr.forEach(selected => {
      var url = _this.getAPIUrl(selected);
      layers.push({
        planet_labs_scene: selected,
        tiles: [url]
      });
    });

    LayerActions.saveDataSettings({
      is_external: true,
      external_layer_type: 'Planet',
      external_layer_config: {
        type: 'multiraster',
        layers
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
    var prevButton = '';
    if(this.props.showPrev){
      prevButton = (
        <div className="left">
          <a className="waves-effect waves-light btn" onClick={this.onPrev}><i className="material-icons left">arrow_back</i>{this.__('Previous Step')}</a>
        </div>
      );
    }

		return (
        <div className="row">
          <Formsy.Form onValidSubmit={this.submit} onValid={this.enableButton} onInvalid={this.disableButton}>
             <div>
              <p>{this.__('Paste the selected IDs from the Planet Explorer API box')}</p>
              <div className="row">
                <TextArea name="selectedIDs" label={this.__('Planet Explorer Selected IDs')}
                  length={2000}
                  validations={{isNotRapidEye:true, isNotSentinel:true, isNotOrtho:true}} validationErrors={{
                   isNotRapidEye: this.__('RapidEye Not Supported: We are currently researching an issue with the RapidEye API, and hope to restore support at a later date.'),
                   isNotOrtho: this.__('Ortho Not Supported: Try a 3-band or 4-band scene instead. We are investigating an issue with the Planet API support for Ortho scenes.'),
                   isNotSentinel: this.__('Sentinel 2 tiles are not yet supported by the Planet API')
                  }}
                  icon="info" className="col s12"required/>
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

module.exports = PlanetLabsSource;
