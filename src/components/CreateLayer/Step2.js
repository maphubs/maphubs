import React from 'react';
import PropTypes from 'prop-types';
var LayerSettings = require('./LayerSettings');
var LayerActions = require('../../actions/LayerActions');
var PresetActions = require('../../actions/presetActions');
var MessageActions = require('../../actions/MessageActions');
import Reflux from 'reflux';
var StateMixin = require('reflux-state-mixin')(Reflux);
var LayerStore = require('../../stores/layer-store');
var LocaleStore = require('../../stores/LocaleStore');
var LocaleMixin = require('../LocaleMixin');
import Progress from '../Progress';

var Step2 = React.createClass({

  mixins:[StateMixin.connect(LayerStore), StateMixin.connect(LocaleStore), LocaleMixin],

  propTypes: {
		groups: PropTypes.array,
    onSubmit: PropTypes.func
  },

  static defaultProps: {
    return {
      groups: [],
      onSubmit: null
    };
  },

  getInitialState() {
    return {
      saving: false
    };
  },

  onSubmit(){
    if(!this.state.layer.is_external && !this.state.layer.is_empty){
      return this.saveDataLoad();
    }else if(this.state.layer.is_empty){
      return this.initEmptyLayer();
    }
    else{
      return this.saveExternal();
    }
  },

  initEmptyLayer() {
    var _this = this;

    //save presets
    PresetActions.loadDefaultPresets();
    PresetActions.submitPresets(true, this.state._csrf, function(err){
      if(err){
        MessageActions.showMessage({title: _this.__('Error'), message: err});
      }else{
        LayerActions.initEmptyLayer(_this.state._csrf, function(err){
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

  saveDataLoad() {
    var _this = this;

    _this.setState({saving: true});
    //save presets
    PresetActions.submitPresets(true, this.state._csrf, function(err){
      if(err){
        MessageActions.showMessage({title: _this.__('Error'), message: err});
          _this.setState({saving: false});
      }else{
        LayerActions.loadData(_this.state._csrf, function(err){
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
    LayerActions.tileServiceInitialized();
    if(this.props.onSubmit){
      this.props.onSubmit();
    }
  },

	render() {
		return (
        <div className="row">
        <Progress id="load-data-progess" title={this.__('Loading Data')} subTitle={this.__('Data Loading: This may take a few minutes for larger datasets.')} dismissible={false} show={this.state.saving}/>
        
            <p>{this.__('Provide Information About the Data Layer')}</p>
            <LayerSettings groups={this.props.groups}               
                submitText={this.__('Save and Continue')} onSubmit={this.onSubmit}
                warnIfUnsaved={false}
                />
      </div>
		);
	}
});

module.exports = Step2;