import React from 'react';
import PropTypes from 'prop-types';
import Reflux from 'reflux';
var StateMixin = require('reflux-state-mixin')(Reflux);

//react components

var Formsy = require('formsy-react');
var TextArea = require('../forms/textArea');
var TextInput = require('../forms/textInput');
var SelectGroup = require('../Groups/SelectGroup');
var Select = require('../forms/select');
var Licenses = require('./licenses');


var LayerStore = require('../../stores/layer-store');
var LayerActions = require('../../actions/LayerActions');
var MessageActions = require('../../actions/MessageActions');
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');

var LayerSettings = React.createClass({

  mixins:[StateMixin.connect(LayerStore), StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    onSubmit: PropTypes.func,
    active: PropTypes.bool,
    onValid: PropTypes.func,
    onInValid: PropTypes.func,
    submitText: PropTypes.string,
    showGroup: PropTypes.bool,
    showPrev: PropTypes.bool,
    onPrev: PropTypes.func,
    prevText: PropTypes.string,
    warnIfUnsaved: PropTypes.bool
  },

  static defaultProps: {
    return {
      onSubmit: null,
      active: true,
      showGroup: true,
      warnIfUnsaved: false,
      showPrev: false
    };
  },

  getInitialState() {
    return {
      canSubmit: false
    };
  },

  componentDidMount(){
    var _this = this;
    window.onbeforeunload = function(){
      if(_this.props.warnIfUnsaved && _this.state.pendingChanges){
        return _this.__('You have not saved your edits, your changes will be lost.');
      }
    };
  },

  onFormChange(){
    this.setState({pendingChanges: true});
  },

  onValid () {
      this.setState({
        canSubmit: true
      });
      if(this.props.onValid){
        this.props.onValid();
      }
    },
    onInvalid () {
      this.setState({
        canSubmit: false
      });
      if(this.props.onInValid){
        this.props.onInValid();
      }
    },


  onSubmit(model) {
    var _this = this;

    var initLayer = false;
    if(!this.state.layer.owned_by_group_id){
      initLayer = true;
    }
    if(!model.group && this.state.layer.owned_by_group_id){
      //editing settings on an existing layer
      model.group = this.state.layer.owned_by_group_id;
    }else if(!model.group && this.state.groups.length == 1){
      //creating a new layer when user is only the member of a single group (not showing the group dropdown)
      model.group = this.state.groups[0].group_id;
    }
    if(!model.private){
      model.private = false;
    }

    LayerActions.saveSettings(model, _this.state._csrf, initLayer, function(err){
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

  onPrev() {
    if(this.props.onPrev) this.props.onPrev();
  },

	render() {

    if(!this.state.groups || this.state.groups.length == 0){
      return (
        <div className="container">
          <div className="row">
            <h5>{this.__('Please Join a Group')}</h5>
            <p>{this.__('Please create or join a group before creating a layer.')}</p>
          </div>
        </div>
      );
    }
    var canChangeGroup = true;
    if(this.state.layer.status === 'published'){
      canChangeGroup = false;
    }
    
    var licenseOptions = Licenses.getLicenses(this.__);


    var prevButton = '', submitIcon = '';
    if(this.props.showPrev){
      prevButton = (
        <div className="left">
          <a className="waves-effect waves-light btn" onClick={this.onPrev}><i className="material-icons left">arrow_back</i>{this.props.prevText}</a>
        </div>
      );

      submitIcon = (
        <i className="material-icons right">arrow_forward</i>
      );
    }

		return (
        <div style={{marginRight: '2%', marginLeft: '2%', marginTop:'10px'}}>
            <Formsy.Form onValidSubmit={this.onSubmit} onChange={this.onFormChange} onValid={this.onValid} onInvalid={this.onInValid}>
              <div className="row">
              <div className="col s12 m6">
                <div className="row">
                  <TextInput name="name" label={this.__('Name')} icon="info" className="col s12"
                      value={this.state.layer.name}
                      validations="maxLength:100" validationErrors={{
                        maxLength: this.__('Name must be 100 characters or less.')
                      }} length={100}
                      dataPosition="top" dataTooltip={this.__('Short Descriptive Name for the Layer')}
                      required/>
                </div>
                <div className="row">
                  <TextArea name="description" label={this.__('Description')} icon="description" className="col s12"
                      value={this.state.layer.description}
                      validations="maxLength:1000" validationErrors={{
                        maxLength: this.__('Description must be 1000 characters or less.')
                      }} length={1000}
                      dataPosition="top" dataTooltip={this.__('Brief Description of the Layer')}
                      required/>
                </div>             
                <div  className="row">
                  <SelectGroup groups={this.state.groups} type="layer" canChangeGroup={canChangeGroup} editing={!canChangeGroup}/>
                </div>
              </div>
              <div className="col s12 m6">
              <div className="row">
                <TextInput name="source" label={this.__('Source Description')} icon="explore" className="col s12"
                  value={this.state.layer.source}
                  validations="maxLength:300" validationErrors={{
                       maxLength: this.__('Name must be 300 characters or less.')
                   }} length={300}
                   dataPosition="top" dataTooltip={this.__('Short Description of the Layer Source')}
                   required/>
              </div>
              <div  className="row">
                  <Select name="license" id="layer-source-select" label={this.__('License')} startEmpty={false}
                    value={this.state.layer.license} defaultValue={this.state.layer.license} options={licenseOptions}
                    note={this.__('Select a license for more information')}
                    icon="info"
                    className="col s12"
                    dataPosition="top" dataTooltip={this.__('Layer License')}
                    />
                </div>
              </div>
            </div>
            <div className="container">
              {prevButton}
              <div className="right">
                  <button type="submit" className="waves-effect waves-light btn" disabled={!this.state.canSubmit}>{submitIcon}{this.props.submitText}</button>
              </div>
            </div>
            
           
          </Formsy.Form>

      </div>
		);
	}
});

module.exports = LayerSettings;
