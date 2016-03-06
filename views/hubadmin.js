var React = require('react');
//var $ = require('jquery');
var EditList = require('../components/EditList');
var HubBanner = require('../components/Hub/HubBanner');
var HubNav = require('../components/Hub/HubNav');

var MessageActions = require('../actions/MessageActions');
var AddItem = require('../components/AddItem');
var slug = require('slug');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var HubStore = require('../stores/HubStore');
var HubActions = require('../actions/HubActions');

var NotificationActions = require('../actions/NotificationActions');
var ConfirmationActions = require('../actions/ConfirmationActions');

var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');

var debug = require('../services/debug')('views/HubAdmin');

var HubAdmin = React.createClass({

  mixins:[StateMixin.connect(HubStore), StateMixin.connect(LocaleStore, {initWithProps: ['locale']})],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    hub: React.PropTypes.object.isRequired,
    layers: React.PropTypes.array,
    members: React.PropTypes.array,
    locale: React.PropTypes.string.isRequired
  },

  getDefaultProps() {
    return {
      layers: [],
      members: []
    };
  },

  getInitialState() {
    HubActions.loadHub(this.props.hub);
    HubActions.loadMembers(this.props.members);
    HubActions.loadLayers(this.props.layers);
    return {
      canSubmit: false
    };
  },

  handleMemberDelete(user){
    ConfirmationActions.showConfirmation({
      title: 'Confirm Removal',
      message: 'Please confirm removal of ' + user.label,
      onPositiveResponse(){
        HubActions.removeMember(user.key, function(err){
          if(err){
            MessageActions.showMessage({title: 'Error', message: err});
          }else{
            NotificationActions.showNotification({message: 'Member Removed'});
          }
        });
      }
    });

  },

  handleMemberMakeAdmin(user){
    if(user.type == 'Administrator'){
      this.handleRemoveMemberAdmin(user);
    }else{
      ConfirmationActions.showConfirmation({
        title: 'Confirm Administrator',
        message: 'Please confirm that you want to make ' + user.label + ' an Administrator.',
        onPositiveResponse(){
          HubActions.setMemberAdmin(user.key, function(err){
            if(err){
              MessageActions.showMessage({title: 'Error', message: err});
            }else{
              NotificationActions.showNotification({message: 'Member is now an Administrator'});
            }
          });
        }
      });
    }

  },

  handleRemoveMemberAdmin(user){
    ConfirmationActions.showConfirmation({
      title: 'Confirm Remove Administrator',
      message: 'Please confirm that you want to remove Administrator permissions for ' + user.label + '.',
      onPositiveResponse(){
        HubActions.removeMemberAdmin(user.key, function(err){
          if(err){
            MessageActions.showMessage({title: 'Error', message: err});
          }else{
            NotificationActions.showNotification({message: 'Member is no longer Administrator'});
          }
        });
      }
    });
  },

  handleAddMember(user){
    debug(user.value.value + ' as Admin:' + user.option);
    HubActions.addMember(user.value.value, user.option, function(err){
      if(err){
        MessageActions.showMessage({title: 'Error', message: err});
      }else{
        NotificationActions.showNotification({message: 'Member Added'});
      }
    });
  },


  handleViewLayer(layer){
    window.location = "/layer/info/" + layer.layer_id + '/' + slug(layer.name);
  },

	render() {

    var membersList = [];
    this.state.members.forEach(function(user){
      membersList.push({
        key: user.id,
        label: user.display_name,
        type: user.role,
        image: user.image,
        icon: 'person',
        actionIcon: 'supervisor_account',
        actionLabel: 'Add/Remove Administrator Access'
      });
    });

    var layersList = [];
    this.state.layers.forEach(function(layer){
      layersList.push({
        key: layer.layer_id,
        label: layer.name,
        type: layer.active ? 'Active' : 'Inactive',
        image: '',
        icon: 'map',
        actionIcon: 'info',
        actionLabel: 'View Layer Info'
      });
    });

		return (
      <div>
        <HubNav hubid={this.props.hub.hub_id}/>
        <main>
          <div className="row no-margin">
            <HubBanner subPage/>
          </div>
          <div className="container">
            <h4>Manage Hub</h4>
             <div className="row">
               <EditList title="Members" items={membersList} onDelete={this.handleMemberDelete} onAction={this.handleMemberMakeAdmin} onError={this.onError} />
              </div>
              <div className="row">
                <h5>Add Hub Member</h5>
                  <AddItem id="hubaddmember" placeholder="Search for User Name" suggestionUrl='/api/user/search/suggestions'
                    optionLabel="Add as Administrator" addButtonLabel="Add and Send Invite"
                    onAdd={this.handleAddMember} onError={this.onError}/>
            </div>

             <div className="row">
               <button onClick={function(){alert('coming soon');}} className="btn red">Delete Hub</button>
             </div>

          </div>
        </main>
			</div>
		);
	}
});

module.exports = HubAdmin;
