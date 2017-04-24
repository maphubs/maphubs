//@flow
import React from 'react';
import isEmpty from 'lodash.isempty';
import HubBanner from '../components/Hub/HubBanner';
import HubNav from '../components/Hub/HubNav';
import HubEditButton from '../components/Hub/HubEditButton';
import HubResources from '../components/Hub/HubResources';
import HubStore from '../stores/HubStore';
import HubActions from '../actions/HubActions';
import MessageActions from '../actions/MessageActions';
import NotificationActions from '../actions/NotificationActions';
import Notification from '../components/Notification';
import Message from '../components/message';
import Confirmation from '../components/confirmation';
import Footer from '../components/footer';
import MapHubsComponent from '../components/MapHubsComponent';
import Reflux from '../components/Rehydrate';
import LocaleStore from '../stores/LocaleStore';

export default class HubResourcesPage extends MapHubsComponent {

  props: {
    hub: Object,
    canEdit:boolean,
    locale: string,
    _csrf: string,
    footerConfig: Object
  }

  static defaultProps = {
    hub: {
      name: "Unknown"
    },
    resources: [],
    canEdit: false
  }

  state = {
    editing: false
  }

  constructor(props: Object){
		super(props);
    this.stores.push(HubStore);
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf});
    Reflux.rehydrate(HubStore, {hub: this.props.hub, canEdit: this.props.canEdit});
	}

  componentDidMount() {
    var _this = this;
    window.onbeforeunload = function(){
      if(_this.state.editing){
        return _this.__('You have not saved the edits for your hub, your changes will be lost.');
      }
    };
  }

  startEditing = () => {
    this.setState({editing: true});
  }

  stopEditing = () => {
    var _this = this;
    HubActions.saveHub(this.state._csrf, function(err){
      if(err){
        MessageActions.showMessage({title: _this.__('Server Error'), message: err});
      }else{
        NotificationActions.showNotification({message: _this.__('Hub Saved')});
        _this.setState({editing: false});
      }
    });
  }

  publish = () => {
    var _this = this;
    if(this.state.unsavedChanges){
      MessageActions.showMessage({title: _this.__('Unsaved Changes'), message: _this.__('Please save your changes before publishing.')});
    }else if(isEmpty(this.state.hub.title) || isEmpty(this.state.hub.description)
            || !this.state.hub.hasLogoImage || !this.state.hub.hasBannerImage){
      MessageActions.showMessage({title: _this.__('Required Content'), message: _this.__('Please complete your hub before publishing. Add a title, description, logo image, and banner image. \n We also recommend adding map layers and publishing your first story.')});
    }else {
      HubActions.publish(this.state._csrf, function(err){
        if(err){
          MessageActions.showMessage({title: _this.__('Server Error'), message: err});
        }else{
          NotificationActions.showNotification({message: _this.__('Hub Published')});
        }
      });
    }
  }

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
          <Footer {...this.props.footerConfig}/>
        </main>
        <Notification />
        <Message />
        <Confirmation />
      </div>
    );
  }
}