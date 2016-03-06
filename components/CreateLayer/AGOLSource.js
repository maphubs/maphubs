
var React = require('react');
var Formsy = require('formsy-react');
//var $ = require('jquery');
var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);

var TextInput = require('../forms/textInput');
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
      canSubmit: false
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
    LayerActions.saveDataSettings({
      is_external: true,
      external_layer_type: 'AGS Feature Service',
      external_layer_config: {
        type: 'ags',
        url: model.featureServiceUrl
      }
    },function(err){
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

  onPrev() {
    if(this.props.onPrev) this.props.onPrev();
  },

	render() {

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
          <Formsy.Form onValidSubmit={this.submit} onValid={this.enableButton} onInvalid={this.disableButton}>

            <div>
              <p>{this.__('ArcGIS Feature Service Source')}</p>
              <div className="row">
                <TextInput name="featureServiceUrl" label={this.__('Feature Service URL')} icon="info" className="col s12" validations="maxLength:250" validationErrors={{
                       maxLength: this.__('Must be 250 characters or less.')
                   }} length={250}
                   dataPosition="top" dataTooltip={this.__('Feature Service URL')}
                   required/>
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

module.exports = AGOLSource;
