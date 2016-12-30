
var React = require('react');
var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);

//react components

var Formsy = require('formsy-react');
var TextArea = require('../forms/textArea');
var TextInput = require('../forms/textInput');
var Toggle = require('../forms/toggle');
var Select = require('../forms/select');


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
    onSubmit: React.PropTypes.func,
    active: React.PropTypes.bool,
    onValid: React.PropTypes.func,
    onInValid: React.PropTypes.func,
    showCancel: React.PropTypes.bool,
    cancelText: React.PropTypes.string,
    onCancel: React.PropTypes.func,
    submitText: React.PropTypes.string,
    create:  React.PropTypes.bool,
    showGroup: React.PropTypes.bool,
    warnIfUnsaved: React.PropTypes.bool
  },

  getDefaultProps() {
    return {
      onSubmit: null,
      active: true,
      create: false,
      showGroup: true,
      warnIfUnsaved: false
    };
  },

  getInitialState() {
    return {
      canSubmit: false,
      created: false
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
    if(!model.group && this.state.layer.owned_by_group_id){
      //editing settings on an existing layer
      model.group = this.state.layer.owned_by_group_id;
    }else if(!model.group && this.state.groups.length == 1){
      //creating a new layer when user is only the member of a single group (not showing the group dropdown)
      model.group = this.state.groups[0].group_id;
    }
    if(this.props.create){
      LayerActions.createLayer(model, _this.state._csrf, function(err){
        if(err){
          MessageActions.showMessage({title: _this.__('Error'), message: err});
        }else{
          _this.setState({pendingChanges: false});
          if(_this.props.onSubmit){
            _this.props.onSubmit();
          }
        }
      });
    }else {
      LayerActions.saveSettings(model, _this.state._csrf, function(err){
        if(err){
          MessageActions.showMessage({title: _this.__('Error'), message: err});
        }else{
          _this.setState({pendingChanges: false});
          if(_this.props.onSubmit){
            _this.props.onSubmit();
          }
        }
      });
    }

  },

  onCancel(){
    this.props.onCancel();
  },

	render() {

    var groups = '';

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
    if(this.props.showGroup){
      if(this.state.groups.length > 1){
      var groupOptions = [];

      this.state.groups.map(function(group){
        groupOptions.push({
          value: group.group_id,
          label: group.name
        });
      });

      groups = (
        <div>
          <p>{this.__('Since you are in multiple groups, please select the group that should own this layer.')}</p>
          <Select name="group" id="layer-settings-select" label={this.__('Group')} startEmpty={startEmpty}
            value={this.state.layer.owned_by_group_id} defaultValue={this.state.layer.owned_by_group_id}
            emptyText={this.__('Choose a Group')} options={groupOptions} className="col s6"
              dataPosition="right" dataTooltip={this.__('Owned by Group')}
              required
              />
        </div>
        );

      }else{
        groups = (
          <div>
            <b>{this.__('Group:')} </b>{this.state.groups[0].name}
          </div>
        );
      }
    }

    var cancel = '', submitIcon = '';
    if(this.props.showCancel){
      cancel = (
        <div className="left">
            <a className="waves-effect waves-light white omh-accent-text redirect btn" onClick={this.onCancel}><i className="material-icons left">delete</i>{this.props.cancelText}</a>
        </div>
      );
      submitIcon = (
        <i className="material-icons right">arrow_forward</i>
      );
    }

    var startEmpty = true;
    if(this.state.layer && this.state.layer.owned_by_group_id){
      startEmpty = false;
    }

		return (
        <div className="container">
            <Formsy.Form onValidSubmit={this.onSubmit} onChange={this.onFormChange} onValid={this.onValid} onInvalid={this.onInValid}>
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
              <div className="row">
                <Toggle name="published" labelOff={this.__('Draft')} labelOn={this.__('Published')} defaultChecked={this.state.layer.published} className="col s4"
                    dataPosition="right" dataTooltip={this.__('Indicate Layer is a Draft')}
                  />
              </div>
            <div  className="row">
              {groups}
            </div>

            {cancel}
            <div className="right">
                <button type="submit" className="waves-effect waves-light btn" disabled={!this.state.canSubmit}>{submitIcon}{this.props.submitText}</button>
            </div>
          </Formsy.Form>

      </div>
		);
	}
});

module.exports = LayerSettings;
