var React = require('react');
var classNames = require('classnames');

var NotificationActions = require('../../actions/NotificationActions');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../../stores/LocaleStore');
var LocaleMixin = require('../LocaleMixin');

var LayerActions = require('../../actions/LayerActions');
var MessageActions = require('../../actions/MessageActions');
var CreateLayer = require('./CreateLayer');

var Step1 = React.createClass({

  mixins:[StateMixin.connect(LocaleStore), LocaleMixin],

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
      created: false,
      canSubmit: false,
      selectedSource: 'local'
    };
  },

  sourceChange(value){
    this.setState({selectedSource: value});
  },

  onPrev() {
    if(this.props.onPrev) this.props.onPrev();
  },

  onSubmit() {
    this.props.onSubmit();
  },

  cancelCallback(){
    this.setState({warnIfUnsaved: false});
    NotificationActions.showNotification({
      message: this.__('Layer Cancelled'),
      onDismiss(){
        window.location="/layers";
      }
    });
  },

   onCancel(){
    var _this = this;
    if(_this.state.created){
      //delete the layer
      LayerActions.cancelLayer(this.state._csrf, function(err){
        if(err){
          MessageActions.showMessage({title: _this.__('Error'), message: err});
        }else{
          _this.cancelCallback();
        }
      });
    }else{
      _this.cancelCallback();
    }

  },

	render() {
    
    return (
        <div className="row">
          <CreateLayer onPrev={this.onPrev} onSubmit={this.onSubmit} 
          showCancel={true} cancelText={this.__('Cancel')} onCancel={this.onCancel}
         />      
      </div>
		);
	}
});

module.exports = Step1;
