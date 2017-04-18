import React from 'react';
import PropTypes from 'prop-types';
var LayerStyle = require('./LayerStyle');
var LayerActions = require('../../actions/LayerActions');
var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../../stores/LocaleStore');
var LocaleMixin = require('../LocaleMixin');

var Step5 = React.createClass({

  mixins:[StateMixin.connect(LocaleStore), LocaleMixin],

  propTypes: {
    onSubmit: PropTypes.func,
    onPrev: PropTypes.func
  },

  onSubmit(layer_id, name) {
    var _this = this;
    LayerActions.setComplete(this.state._csrf, function(){
      if(_this.props.onSubmit) _this.props.onSubmit(layer_id, name);
    });
  },

  onPrev() {
    if(this.props.onPrev) this.props.onPrev();
  },

	render() {
		return (
        <div className="row">
          <LayerStyle waitForTileInit
              showPrev prevText={this.__('Previous')} onPrev={this.onPrev}
              onSubmit={this.onSubmit} />
      </div>
		);
	}
});

module.exports = Step5;
