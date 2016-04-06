var React = require('react');

var LayerSettings = require('./LayerSettings');
var classNames = require('classnames');

var LayerActions = require('../../actions/LayerActions');
var NotificationActions = require('../../actions/NotificationActions');
var MessageActions = require('../../actions/MessageActions');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');

var Step1 = React.createClass({

  mixins:[StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
		groups: React.PropTypes.array,
    onSubmit: React.PropTypes.func,
    active: React.PropTypes.bool.isRequired
  },

  getDefaultProps() {
    return {
      groups: [],
      onSubmit: null,
      active: false
    };
  },

  getInitialState() {
    return {
      created: false
    };
  },

  submit () {
    NotificationActions.showNotification({message: this.__('Layer Saved'),dismissAfter: 1000, onDismiss: this.props.onSubmit});
  },

  cancelCallback(){
    NotificationActions.showNotification({
      message: this.__('Layer Cancelled'),
      onDismiss(){
        window.location="/layers";
      }
    });
  },

  handleCancel(){
    var _this = this;
    if(_this.state.created){
      //delete the layer
      LayerActions.deleteLayer(function(err){
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

    //hide if not active
    var className = classNames('row');
    if(!this.props.active) {
      className = classNames('row', 'hidden');
    }

		return (
        <div className={className}>
            <p>{this.__('Provide Information About the Data Layer')}</p>
            <LayerSettings groups={this.props.groups} create={true}
                showCancel={true} cancelText={this.__('Cancel')} onCancel={this.handleCancel}
                submitText={this.__('Save and Continue')} onSubmit={this.submit}
                />
      </div>
		);
	}
});

module.exports = Step1;
