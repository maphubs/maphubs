var React = require('react');

var isEmpty = require('lodash.isempty');


var HubBanner = require('../components/Hub/HubBanner');
var HubNav = require('../components/Hub/HubNav');
var HubEditButton = require('../components/Hub/HubEditButton');

var HubResources = require('../components/Hub/HubResources');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var HubStore = require('../stores/HubStore');
var HubActions = require('../actions/HubActions');
var MessageActions = require('../actions/MessageActions');
var NotificationActions = require('../actions/NotificationActions');
var Notification = require('../components/Notification');
var Message = require('../components/message');
var Confirmation = require('../components/confirmation');
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');
var Footer = require('../components/footer');

var HubResourcesPage = React.createClass({

  mixins:[StateMixin.connect(HubStore, {initWithProps: ['hub']}), StateMixin.connect(LocaleStore, {initWithProps: ['locale', '_csrf']})],
  propTypes: {
    hub: React.PropTypes.object,
    canEdit: React.PropTypes.bool,
    locale: React.PropTypes.string.isRequired
  },

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  getDefaultProps() {
    return {
      hub: {
        name: "Unknown"
      },
      resources: [],
      canEdit: false
    };
  },

  getInitialState() {
    return {
      editing: false
    };
  },

  componentDidMount() {
    var _this = this;
    window.onbeforeunload = function(){
      if(_this.state.editing){
        return _this.__('You have not saved the edits for your hub, your changes will be lost.');
      }
    };
  },

  startEditing(){
    this.setState({editing: true});
  },

  stopEditing(){
    var _this = this;
    HubActions.saveHub(function(err){
      if(err){
        MessageActions.showMessage({title: _this.__('Server Error'), message: err});
      }else{
        NotificationActions.showNotification({message: _this.__('Hub Saved')});
        _this.setState({editing: false});
      }
    });

  },

  publish(){
    var _this = this;
    if(this.state.unsavedChanges){
      MessageActions.showMessage({title: _this.__('Unsaved Changes'), message: _this.__('Please save your changes before publishing.')});
    }else if(isEmpty(this.state.hub.title) || isEmpty(this.state.hub.description)
            || !this.state.hub.hasLogoImage || !this.state.hub.hasBannerImage){
      MessageActions.showMessage({title: _this.__('Required Content'), message: _this.__('Please complete your hub before publishing. Add a title, description, logo image, and banner image. \n We also recommend adding map layers and publishing your first story.')});
    }else {
      HubActions.publish(function(err){
        if(err){
          MessageActions.showMessage({title: _this.__('Server Error'), message: err});
        }else{
          NotificationActions.showNotification({message: _this.__('Hub Published')});
        }
      });
    }
  },

  render() {
    var editButton = '';
    var publishButton = '';

    if(this.props.canEdit){
      editButton = (
        <HubEditButton editing={this.state.editing}
          startEditing={this.startEditing} stopEditing={this.stopEditing} />
      );

      if(!this.state.hub.published){
        publishButton = (
          <div className="center center-align" style={{margin: 'auto', position: 'fixed', top: '15px', right: 'calc(50% - 60px)'}}>
            <button className="waves-effect waves-light btn" onClick={this.publish}>{this.__('Publish')}</button>
          </div>
        );
      }
    }

    return (
      <div>
        <HubNav hubid={this.props.hub.hub_id} canEdit={this.props.canEdit}/>
        <main style={{marginTop: '0px'}}>
          {publishButton}
          <div className="row">
            <HubBanner editing={false} hubid={this.props.hub.hub_id} subPage/>
          </div>
          <div className="container">
            <HubResources editing={this.state.editing} />
          </div>
          {editButton}
          <Footer />
        </main>
        <Notification />
        <Message />
        <Confirmation />
      </div>
    );
  }
});

module.exports = HubResourcesPage;
