var React = require('react');
var Formsy = require('formsy-react');
var $ = require('jquery');
var EditList = require('../components/EditList');
var Header = require('../components/header');

var TextArea = require('../components/forms/textArea');
var TextInput = require('../components/forms/textInput');
var Toggle = require('../components/forms/toggle');
var MessageActions = require('../actions/MessageActions');
var AddItem = require('../components/AddItem');
var slug = require('slug');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var GroupStore = require('../stores/GroupStore');
var GroupActions = require('../actions/GroupActions');

var NotificationActions = require('../actions/NotificationActions');
var ConfirmationActions = require('../actions/ConfirmationActions');
var ImageCrop = require('../components/ImageCrop');

var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');

var debug = require('../services/debug')('views/GroupAdmin');

var GroupAdmin = React.createClass({

  mixins:[StateMixin.connect(GroupStore, {initWithProps: ['group', 'layers', 'members']}), StateMixin.connect(LocaleStore, {initWithProps: ['locale', '_csrf']})],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    group: React.PropTypes.object.isRequired,
    layers: React.PropTypes.array,
    maps: React.PropTypes.array,
    hubs: React.PropTypes.array,
    members: React.PropTypes.array,
    locale: React.PropTypes.string.isRequired
  },

  getDefaultProps() {
    return {
      layers: [],
      maps: [],
      hubs: [],
      members: []
    };
  },

  getInitialState() {
    return {
      canSubmit: false
    };
  },

  componentDidMount(){
    $('.groupadmin-tooltips').tooltip();
  },

  enableButton () {
      this.setState({
        canSubmit: true
      });
    },
    disableButton () {
      this.setState({
        canSubmit: false
      });
    },

    onError(msg){
      MessageActions.showMessage({title: this.__('Error'), message: msg});
    },

    submit (model) {
      var _this = this;
      GroupActions.updateGroup(model.group_id, model.name, model.description, model.location, model.published, _this.state._csrf, function(err){
        if(err){
          MessageActions.showMessage({title: _this.__('Server Error'), message: err});
        }else{
          NotificationActions.showNotification(
            {
              message: _this.__('Group Saved'),
              position: 'bottomright',
              dismissAfter: 3000,
              onDismiss() {
                window.location = "/group/" + _this.state.group.group_id;
              }
          });
        }
      });
    },

    checkGroupIdAvailable(id){
      var _this = this;
      //if the form is modified but put back to the currently saved ID, just return true
      if (id == this.props.group.group_id) return true;

      var result = false;
      //only check if a valid value was provided and we are running in the browser
      if (id && typeof window !== 'undefined') {
          $.ajax({
           type: "POST",
           url: '/api/group/checkidavailable',
           contentType : 'application/json;charset=UTF-8',
           dataType: 'json',
           data: JSON.stringify({id}),
            async: false,
            success(msg){
              if(msg.available){
                result = true;
              }
            },
            error(msg){
              MessageActions.showMessage({title: _this.__('Server Error'), message: msg});
            },
            complete(){
            }
        });
      }
      return result;

      },

    componentWillMount() {
      var _this = this;
      Formsy.addValidationRule('isAvailable', function (values, value) {
          return _this.checkGroupIdAvailable(value);

      });
    },


  handleMemberDelete(user){
    var _this = this;
    ConfirmationActions.showConfirmation({
      title:  _this.__('Confirm Removal'),
      message:  _this.__('Please confirm removal of ') + user.label,
      onPositiveResponse(){
        GroupActions.removeMember(user.key, _this.state._csrf, function(err){
          if(err){
            MessageActions.showMessage({title:  _this.__('Error'), message: err});
          }else{
            NotificationActions.showNotification({message:  _this.__('Member Removed')});
          }
        });
      }
    });

  },

  handleGroupDelete(){
    var _this = this;
    ConfirmationActions.showConfirmation({
      title: _this.__('Confirm Deletion'),
      message: _this.__('Please confirm removal of group ') + this.state.group.name,
      onPositiveResponse(){
        GroupActions.deleteGroup(_this.state._csrf, function(err){
          if(err){
            MessageActions.showMessage({title: _this.__('Error'), message: err});
          }else{
            NotificationActions.showNotification({
              message: _this.__('Group Deleted'),
              onDismiss(){
                window.location = '/groups';
              }
            });
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
        title: _this.__('Confirm Administrator'),
        message: _this.__('Please confirm that you want to make this user an Administrator: ') + user.label,
        onPositiveResponse(){
          GroupActions.setMemberAdmin(user.key, _this.state._csrf, function(err){
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
      title: _this.__('Confirm Remove Administrator'),
      message: _this.__('Please confirm that you want to remove Administrator permissions for ') + user.label + '.',
      onPositiveResponse(){
        GroupActions.removeMemberAdmin(user.key, _this.state._csrf, function(err){
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
    GroupActions.addMember(user.value.value, user.option, _this.state._csrf, function(err){
      if(err){
        MessageActions.showMessage({title: _this.__('Error'), message: err});
      }else{
        NotificationActions.showNotification({message: _this.__('Member Added'), dismissAfter: 7000});
      }
    });
  },

  showImageCrop(){
    this.refs.imagecrop.show();
  },

  onCrop(data){
    var _this = this;
    //send data to server
    GroupActions.setGroupImage(data, _this.state._csrf, function(err){
      if(err){
        MessageActions.showMessage({title: _this.__('Server Error'), message: err});
      }else{
        NotificationActions.showNotification(
          {
            message: _this.__('Image Saved'),
            position: 'bottomright',
            dismissAfter: 3000
        });
      }
    });
    //this.pasteHtmlAtCaret('<img class="responsive-img" src="' + data + '" />');
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

    var isPublished = false;
    if(this.state.group.published){
      isPublished = true;
    }

    var  groupUrl = '/group/' + this.props.group.group_id;

		return (
      <div>
        <Header />
        <main>

        <div className="container">
          <div className="row">
             <div className="col s12">
               <p>&larr; <a href={groupUrl}>{this.__('Back to Group')}</a></p>
             </div>
           </div>
          <div className="row" style={{marginTop: '20px'}}>
            <div className="col s12 m6 l6">
              <img  alt={this.__('Group Photo')} width="300" className="" src={'/group/' + this.state.group.group_id + '/image?' + new Date().getTime()}/>
            </div>
            <div className="col s12 m6 l6">
              <button className="waves-effect waves-light btn" onClick={this.showImageCrop}>{this.__('Change Image')}</button>
            </div>

          </div>
          <div className="row">
            <h4>{this.props.group.name}</h4>
          </div>
          <div className="divider"></div>
          <div className="row">
            <Formsy.Form onValidSubmit={this.submit} onValid={this.enableButton} onInvalid={this.disableButton}>
              <div className="row">
                <TextInput name="group_id" label={this.__('Group ID')} icon="group_work" className="col s4"
                    validations={{matchRegexp: /^[a-zA-Z0-9-]*$/, maxLength:25, isAvailable:true}} validationErrors={{
                       maxLength: this.__('ID must be 25 characters or less.'),
                       matchRegexp: this.__('Can only contain letters, numbers, or dashes.'),
                       isAvailable: this.__('ID already taken, please try another.')
                   }} length={25}
                    successText={this.__('ID is Available')}
                    dataPosition="right" dataTooltip={this.__('Identifier for the Group. This will be used in links and URLs for your group\'s content.')}
                    value={this.state.group.group_id}
                    required/>
              </div>
              <div className="row">
                <TextInput name="name" label={this.__('Name')} icon="info" className="col s12" validations="maxLength:100" validationErrors={{
                       maxLength: this.__('Name must be 100 characters or less.')
                   }} length={100}
                    dataPosition="top" dataTooltip={this.__('Short Descriptive Name for the Group')}
                    value={this.state.group.name}
                    required/>
              </div>
              <div className="row">
                <TextArea name="description" label={this.__('Description')} icon="description" className="col s12" validations="maxLength:500" validationErrors={{
                       maxLength: this.__('Description must be 500 characters or less.')
                   }} length={500}
                    dataPosition="top" dataTooltip={this.__('Brief Description of the Group')}
                    value={this.state.group.description}
                    required/>
              </div>
              <div className="row">
                <TextInput name="location" label={this.__('Location')} icon="navigation" className="col s12" validations="maxLength:100" validationErrors={{
                       maxLength: this.__('Location must be 100 characters or less.')
                   }} length={100}
                    dataPosition="top" dataTooltip={this.__('Country or City Where the Group is Located')}
                    value={this.state.group.location}
                    required/>
              </div>
              <div className="row">
                <Toggle name="published" labelOff={this.__('Draft')} labelOn={this.__('Published')} className="col s12"
                    dataPosition="top" dataTooltip={this.__('Include in Public Group Listings')}
                    defaultChecked={isPublished}
                  />
              </div>
              <div className="right">
                <button className="btn waves-effect waves-light" type="submit" name="action">{this.__('Update')}</button>
              </div>

            </Formsy.Form>
           </div>
           <div className="row">
             <EditList title="Members" items={membersList} onDelete={this.handleMemberDelete} onAction={this.handleMemberMakeAdmin} onError={this.onError} />
            </div>
            <div className="row">
              <h5>{this.__('Add Group Member')}</h5>
              <AddItem placeholder={this.__('Search for User Name')} suggestionUrl='/api/user/search/suggestions'
                optionLabel={this.__('Add as Administrator')} addButtonLabel={this.__('Add and Send Invite')}
                onAdd={this.handleAddMember} onError={this.onError}/>
          </div>
          <div className="row">
            <ul className="collection with-header">
              <li className="collection-header">
                <h4>{this.__('Layers')}</h4>
              </li>
              {this.props.layers.map(function (layer, i) {
                return (
                  <li className="collection-item" key={layer.layer_id}>
                    <div>{layer.name}
                      <a className="secondary-content" href={'/layer/map/' + layer.layer_id + '/' + slug(layer.name)}>
                        <i className="material-icons">map</i>
                      </a>
                      <a className="secondary-content" href={'/layer/info/' + layer.layer_id + '/' + slug(layer.name)}>
                        <i className="material-icons">info</i>
                      </a>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="row">
            <ul className="collection with-header">
              <li className="collection-header">
                <h4>{this.__('Maps')}</h4>
              </li>
              {this.props.maps.map(function (map, i) {
                return (
                  <li className="collection-item" key={map.map_id}>
                    <div>{map.title}
                      <a className="secondary-content" href={'/map/view/' + map.map_id + '/' + slug(map.title)}>
                        <i className="material-icons">map</i>
                      </a>                     
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="row">
            <ul className="collection with-header">
              <li className="collection-header">
                <h4>{this.__('Hubs')}</h4>
              </li>
              {this.props.hubs.map(function (hub, i) {
                return (
                  <li className="collection-item" key={hub.hub_id}>
                    <div>{hub.name}                
                      <a className="secondary-content" href={'/hub/' + hub.hub_id}>
                        <i className="material-icons">info</i>
                      </a>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="fixed-action-btn action-button-bottom-right">
            <a className="btn-floating btn-large red groupadmin-tooltips"
              onClick={this.handleGroupDelete}
              data-delay="50" data-position="left" data-tooltip={this.__('Delete Group')}
              >
              <i className="large material-icons">delete</i>
            </a>
          </div>

        </div>
        <ImageCrop ref="imagecrop" aspectRatio={1} lockAspect={true} resize_width={600} resize_height={600} onCrop={this.onCrop} />
        </main>
			</div>
		);
	}
});

module.exports = GroupAdmin;
