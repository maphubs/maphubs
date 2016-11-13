var React = require('react');
var classNames = require('classnames');

var LayerStyle = require('./LayerStyle');
var LayerActions = require('../../actions/LayerActions');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');

var Step5 = React.createClass({

  mixins:[StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    onSubmit: React.PropTypes.func,
    active: React.PropTypes.bool.isRequired,
    onPrev: React.PropTypes.func
  },

  getDefaultProps() {
    return {
      active: false
    };
  },

  getInitialState() {
    return {

    };
  },

  onSubmit(layer_id, name) {
    var _this = this;
    LayerActions.setComplete(function(){
      if(_this.props.onSubmit) _this.props.onSubmit(layer_id, name);
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

		return (
        <div className={className}>
          <LayerStyle waitForTileInit
              showPrev prevText={this.__('Previous')} onPrev={this.onPrev}
              onSubmit={this.onSubmit} />
      </div>
		);
	}
});

module.exports = Step5;
