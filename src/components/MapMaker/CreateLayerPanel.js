import React from 'react';
var LayerActions = require('../../actions/LayerActions');
var LayerStore = require('../../stores/layer-store');
var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../../stores/LocaleStore');
var LocaleMixin = require('../LocaleMixin');
var MessageActions = require('../../actions/MessageActions');

var CreateLayerPanel = React.createClass({

  mixins:[StateMixin.connect(LayerStore), StateMixin.connect(LocaleStore), LocaleMixin],

  createEmptyLayer(){
    var _this = this;
    LayerActions.createLayer(this.state._csrf, err =>{
      if(err){
        MessageActions.showMessage({title: _this.__('Error'), message: err});
      }else{
        _this.setState({pendingChanges: false});
        if(_this.props.onSubmit){
          _this.props.onSubmit();
        }
      }
    });
  },

  render(){
    return (
      <div></div>
    );
  }

});

module.exports = CreateLayerPanel;