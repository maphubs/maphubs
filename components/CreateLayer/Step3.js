var React = require('react');
var classNames = require('classnames');


var LayerSource = require('./LayerSource');
var MessageActions = require('../../actions/MessageActions');
import Progress from '../Progress';


var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LayerStore = require('../../stores/layer-store');
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');

var PresetActions = require('../../actions/presetActions');
var LayerActions = require('../../actions/LayerActions');

var Step3 = React.createClass({

  mixins:[StateMixin.connect(LayerStore), StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    onSubmit: React.PropTypes.func,
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
      saving: false
    };
  },

  onSubmit(){
    if(!this.state.layer.is_external){
      return this.saveDataLoad();
    }else{
      return this.saveExternal();
    }
  },

  saveDataLoad() {
    var _this = this;

    _this.setState({saving: true});
    //save presets
    PresetActions.submitPresets(true, function(err){
      if(err){
        MessageActions.showMessage({title: _this.__('Error'), message: err});
          _this.setState({saving: false});
      }else{
        LayerActions.loadData(function(err){
          _this.setState({saving: false});
          if(err){
            MessageActions.showMessage({title: _this.__('Error'), message: err});
          }else{
            LayerActions.tileServiceInitialized();
            if(_this.props.onSubmit){
              _this.props.onSubmit();
            }
          }
        });
      }
    });
  },

  saveExternal() {
    this.props.onSubmit();
  },

  onCancel() {
    if(this.props.onPrev) this.props.onPrev();
  },

	render() {
    //hide if not active
    var className = classNames('row');
    if(!this.props.active) {
      className = classNames('row', 'hidden');
    }

		return (
      <div className={className}>
        <Progress id="load-data-progess" title={this.__('Loading Data')} subTitle={this.__('Your data is being loaded into MapHubs. This may take a few minutes for larger datasets.')} dismissible={false} show={this.state.saving}/>
        <LayerSource
            showCancel={true} cancelText={this.__('Previous')} onCancel={this.onCancel}
            submitText={this.__('Save and Continue')} onSubmit={this.onSubmit}
          />
      </div>
		);
	}
});

module.exports = Step3;
