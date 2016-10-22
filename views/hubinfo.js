var React = require('react');
//var $ = require('jquery');
var isEmpty = require('lodash.isempty');


var HubBanner = require('../components/Hub/HubBanner');
var HubMap = require('../components/Hub/HubMap');
var HubStories = require('../components/Hub/HubStories');
var HubNav = require('../components/Hub/HubNav');
var HubLinkSection = require('../components/Hub/HubLinkSection');
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

var config = require('../clientconfig');

import Progress from '../components/Progress';

var HubInfo = React.createClass({

  mixins:[
    StateMixin.connect(HubStore, {initWithProps: ['hub', 'layers', 'members', 'stories', 'canEdit']}),
    StateMixin.connect(LocaleStore, {initWithProps: ['locale']})
  ],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    hub: React.PropTypes.object,
    layers: React.PropTypes.array,
    members: React.PropTypes.array,
    stories: React.PropTypes.array,
    canEdit: React.PropTypes.bool,
    locale: React.PropTypes.string.isRequired
  },

  getDefaultProps() {
    return {
      hub: {
        name: "Unknown"
      },
      layers: [],
      members: [],
      stories: [],
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
    }else if(isEmpty(this.state.hub.name) || isEmpty(this.state.hub.description)
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
          <div className="center center-align" style={{margin: 'auto', position: 'fixed', top: '15px', zIndex: '1', right: 'calc(50% - 60px)'}}>
            <button className="waves-effect waves-light btn" onClick={this.publish}>{this.__('Publish')}</button>
          </div>
        );
      }
    }

    var linkBaseUrl = '';
    if(config.mapHubsPro){
      linkBaseUrl = '/hub/' + this.props.hub.hub_id + '/';
    }

    return (
      <div>
        <HubNav hubid={this.props.hub.hub_id} canEdit={this.props.canEdit}/>
        <main  style={{height: '100%', marginTop: '0px'}}>
          {publishButton}
          <div className="row no-margin">
            <HubBanner editing={this.state.editing} hubid={this.props.hub.hub_id}/>
          </div>
          <div className="container" style={{height: '100%'}}>
              <HubLinkSection hubid={this.props.hub.hub_id} />
              <div className="row" style={{height: '70%'}}>
                <a href={linkBaseUrl + 'map'}><h5 className="hub-section" style={{marginLeft: '10px'}}>{this.__('Map')}</h5></a>
                <hr />
                <HubMap editing={this.state.editing} height="calc(100% - 65px)" hub={this.state.hub} border/>
                <div className="center-align" style={{marginTop: '10px', marginBottom:'10px'}}>
                  <a href={linkBaseUrl + 'map'} className="btn">{this.__('View Larger Map')}</a>
                </div>
              </div>
              <div className="row">
                <a href={linkBaseUrl + 'stories'}><h5 className="hub-section" style={{marginLeft: '10px'}}>{this.__('Stories')}</h5></a>
                <hr />
                <HubStories hub={this.props.hub}
                  editing={this.state.editing}
                  stories={this.props.stories} limit={3}/>
                <div className="center-align" style={{marginTop: '10px', marginBottom:'10px'}}>
                  <a href={linkBaseUrl + 'stories'} className="btn">{this.__('View More Stories')}</a>
                </div>
              </div>
              <div className="row">
                <a href={linkBaseUrl + 'resources'}><h5 className="hub-section" style={{marginLeft: '10px'}}>{this.__('Resources')}</h5></a>
                <hr/>
                <HubResources editing={this.state.editing} />
                <div className="center-align" style={{marginTop: '10px', marginBottom:'10px'}}>
                  <a href={linkBaseUrl + 'resources'} className="btn">{this.__('View Resources')}</a>
                </div>
              </div>
            </div>

          {editButton}

        </main>
        <Notification />
        <Message />
        <Confirmation />
        <Progress id="saving-hub" title={this.__('Saving')} subTitle="" dismissible={false} show={this.state.saving}/>
      </div>
    );
  }
});

module.exports = HubInfo;
