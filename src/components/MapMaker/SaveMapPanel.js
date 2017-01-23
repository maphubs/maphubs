var React = require('react');


var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');
var MapMakerStore = require('../../stores/MapMakerStore');
var UserStore = require('../../stores/UserStore');
var UserActions = require('../../actions/UserActions');
var Formsy = require('formsy-react');
var TextInput = require('../forms/textInput');
var NotificationActions = require('../../actions/NotificationActions');
var SelectGroup = require('../Groups/SelectGroup');
var Toggle = require('../forms/toggle');

var SaveMapPanel = React.createClass({

  mixins:[StateMixin.connect(MapMakerStore), StateMixin.connect(UserStore), StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes:  {
    onSave: React.PropTypes.func.isRequired,
    groups: React.PropTypes.array
  },

  getInitialState(){
    var ownedByGroup = false;
    if(this.props.groups && this.props.groups.length > 0){
      //suggest a group by default if user is member of groups
      ownedByGroup = true;
    }
    return {
      canSave: false,
      ownedByGroup
    };
  },

  enableSaveButton() {
    this.setState({
      canSave: true
    });
  },

  disableSaveButton() {
    this.setState({
      canSave: false
    });
  },

  recheckLogin(){
    UserActions.getUser(function(err){
      if(err){
        NotificationActions.showNotification({message: this.__('Not Logged In - Please Login Again'), dismissAfter: 3000, position: 'topright'});
      }
    });
  },

  onSave(model){
  
    if(!model.title || model.title == ''){
      NotificationActions.showNotification({message: this.__('Please Add a Title'), dismissAfter: 5000, position: 'topright'});
      return;
    }

    if(!model.group && this.props.groups.length == 1){
        //creating a new layer when user is only the member of a single group (not showing the group dropdown)
        model.group = this.props.groups[0].group_id;
      }
    this.props.onSave(model);
  },

  onOwnedByGroup(ownedByGroup){
    this.setState({ownedByGroup});
  },

  render(){

    var groups = '', groupToggle = '', editing = false;
    if(this.props.groups && this.props.groups.length > 0){
   
        if(this.state.map_id && this.state.map_id > 0){
          editing = true;
        }else{
          //if the user is in a group, show group options
          groupToggle = (
            <div className="row">   
              <Toggle name="ownedByGroup" labelOff={this.__('Owned by Me')} labelOn={this.__('Owned by My Group')} 
              checked={this.state.ownedByGroup} className="col s12"
              onChange={this.onOwnedByGroup}
                  dataPosition="right" dataTooltip={this.__('Select who should own this map')}
                />
            </div>  
          );
        }
  
      if(this.state.ownedByGroup){
        //show group selection
         groups = (
          <div className="row">       
            <SelectGroup groups={this.props.groups} type="map" canChangeGroup={!editing} editing={editing}/>
          </div>        
        );
      }
     
    }else{
      //owned by the user account is the default, display a message about groups?
    }

    if(this.state.loggedIn){
     return (
        <Formsy.Form onValidSubmit={this.props.onSave} onValid={this.enableSaveButton} onInvalid={this.disableSaveButton}>
          <div className="row">
            <TextInput name="title"
              defaultValue={this.state.title} value={this.state.title}
              label={this.__('Map Title')}
              className="col s12" length={200}
               required/>
          </div>
          {groupToggle}
          {groups}
          <div className="row">
            <div className="col s12 valign-wrapper">
                  <button type="submit" className="valign waves-effect waves-light btn" style={{margin: 'auto'}} disabled={!this.state.canSave}>{this.__('Save Map')}</button>
            </div>
          </div>

        </Formsy.Form>
      );
    }else{
     return (
        <div>
          <div className="row center-align">
            <p>{this.__('You must login or sign up before saving a map.')}</p>
          </div>
          <div className="row center-align">
            <a className="btn" href="/login" target="_blank">{this.__('Login')}</a>
          </div>
          <div className="row center-align">
            <a className="btn" onClick={this.recheckLogin}>{this.__('Retry')}</a>
          </div>
        </div>
      );
    }

  }
});
module.exports = SaveMapPanel;
