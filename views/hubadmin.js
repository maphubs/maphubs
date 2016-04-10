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
var Notification = require('../components/Notification');
var Message = require('../components/message');
var Confirmation = require('../components/confirmation');

var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');

var debug = require('../services/debug')('views/HubAdmin');

var HubAdmin = React.createClass({

  mixins:[StateMixin.connect(HubStore, {initWithProps: ['hub']}), StateMixin.connect(LocaleStore, {initWithProps: ['locale']})],

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
    var _this = this;
    ConfirmationActions.showConfirmation({
      title: 'Confirm Removal',
      message: 'Please confirm removal of ' + user.label,
      onPositiveResponse(){
        HubActions.removeMember(user.key, function(err){
          if(err){
            MessageActions.showMessage({title: 'Error', message: err});
          }else{
            NotificationActions.showNotification({message: _this.__('Member Removed'), dismissAfter: 7000});
          }
        });
      }
    });

  },

  handleMemberMakeAdmin(user){
    var _this = this;
    if(user.type == 'Administrator'){
      this.handleRemoveMemberAdmin(user);
    }else{
      ConfirmationActions.showConfirmation({
        title: this.__('Confirm Administrator'),
        message: this.__('Please confirm that you want to make this user an Administrator: ') + user.label,
        onPositiveResponse(){
          HubActions.setMemberAdmin(user.key, function(err){
            if(err){
              MessageActions.showMessage({title: _this.__('Error'), message: err});
            }else{
              NotificationActions.showNotification({message: _this.__('Member is now an Administrator'), dismissAfter: 7000});
            }
          });
        }
      });
    }

  },

  handleRemoveMemberAdmin(user){
    var _this = this;
    ConfirmationActions.showConfirmation({
      title: this.__('Confirm Remove Administrator'),
      message: this.__('Please confirm that you want to remove Administrator permissions for: ') + user.label,
      onPositiveResponse(){
        HubActions.removeMemberAdmin(user.key, function(err){
          if(err){
            MessageActions.showMessage({title: _this.__('Error'), message: err});
          }else{
            NotificationActions.showNotification({message: _this.__('Member is no longer an Administrator'), dismissAfter: 7000});
          }
        });
      }
    });
  },

  handleAddMember(user){
    var _this = this;
    debug(user.value.value + ' as Admin:' + user.option);
    HubActions.addMember(user.value.value, user.option, function(err){
      if(err){
        MessageActions.showMessage({title: 'Error', message: err});
      }else{
        NotificationActions.showNotification({message: _this.__('Member Added'), dismissAfter: 7000});
      }
    });
  },


  handleViewLayer(layer){
    window.location = "/layer/info/" + layer.layer_id + '/' + slug(layer.name);
  },

	render() {
    var _this = this;
    var membersList = [];
    this.state.members.forEach(function(user){
      membersList.push({
        key: user.id,
        label: user.display_name,
        type: user.role,
        image: user.image,
        icon: 'person',
        actionIcon: 'supervisor_account',
        actionLabel: _this.__('Add/Remove Administrator Access')
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
        actionLabel: _this.__('View Layer Info')
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
            <h4>{this.__('Manage Hub')}</h4>
             <div className="row">
               <EditList title="Members" items={membersList} onDelete={this.handleMemberDelete} onAction={this.handleMemberMakeAdmin} onError={this.onError} />
              </div>
              <div className="row">
                <h5>{this.__('Add Hub Member')}</h5>
                  <AddItem id="hubaddmember" placeholder={this.__('Search for User Name')} suggestionUrl='/api/user/search/suggestions'
                    optionLabel={this.__('Add as Administrator')} addButtonLabel={this.__('Add and Send Invite')}
                    onAdd={this.handleAddMember} onError={this.onError}/>
            </div>

             <div className="row">
               <button onClick={function(){alert('coming soon');}} className="btn red">{this.__('Delete Hub')}</button>
             </div>

          </div>
        </main>
        <Notification />
        <Message />
        <Confirmation />
			</div>
		);
	}
});

module.exports = HubAdmin;
