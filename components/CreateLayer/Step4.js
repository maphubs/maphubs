var React = require('react');
var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var classNames = require('classnames');
var $ = require('jquery');


var PresetEditor = require('./PresetEditor');
var MessageActions = require('../../actions/MessageActions');
import Progress from '../Progress';

var LayerStore = require('../../stores/layer-store');
var LayerActions = require('../../actions/LayerActions');
var PresetActions = require('../../actions/presetActions');

var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');

var Step4 = React.createClass({

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
      layer_id: null,
      onSubmit: null,
      active: false
    };
  },

  getInitialState() {
    return {
      canSubmit: false,
      saving: false
    };
  },

  save(){
    $('body').scrollTop(0);
    if(!this.state.layer.is_external){
      return this.saveDataLoad();
    }else{
      return this.saveExternal();
    }
  },

  saveExternal() {
    this.props.onSubmit();
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

  onPrev() {
    if(this.props.onPrev) this.props.onPrev();
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


	render() {

    //hide if not active
    var className = classNames('container');
    if(!this.props.active) {
      className = classNames('container', 'hidden');
    }

    var prevButton = '';
    if(this.props.showPrev){
      prevButton = (
        <div className="left">
          <a className="waves-effect waves-light btn" onClick={this.onPrev}><i className="material-icons left">arrow_back</i>{this.__('Previous Step')}</a>
        </div>
      );
    }
    var presetEditor = '';
    if(!this.state.layer.is_external){
      presetEditor = (
        <div>
          <h5>Data Fields</h5>
            <div className="right">
              <button onClick={this.save} className="waves-effect waves-light btn" disabled={!this.state.canSubmit}><i className="material-icons right">arrow_forward</i>{this.__('Save and Continue')}</button>
            </div>
          <PresetEditor onValid={this.enableButton} onInvalid={this.disableButton}/>
        </div>
      );
    }else {
      presetEditor = (
        <h5 style={{margin: '20px'}}>{this.__('Unable to modify fields from external data sources, please continue to next step.')}</h5>
      );
    }
		return (
        <div className={className}>
          <Progress id="load-data-progess" title={this.__('Loading Data')} subTitle={this.__('Your data is being loaded into MapHubs. This may take a few minutes for larger datasets.')} dismissible={false} show={this.state.saving}/>
            {presetEditor}
            {prevButton}
            <div className="right">
              <button onClick={this.save} className="waves-effect waves-light btn" disabled={!this.state.layer.is_external && !this.state.canSubmit}><i className="material-icons right">arrow_forward</i>{this.__('Save and Continue')}</button>
            </div>
      </div>
		);
	}
});

module.exports = Step4;
