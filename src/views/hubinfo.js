//@flow
import React from 'react';
import isEmpty from 'lodash.isempty';
import HubBanner from '../components/Hub/HubBanner';
import HubMap from '../components/Hub/HubMap';
import HubStories from '../components/Hub/HubStories';
import HubNav from '../components/Hub/HubNav';
import HubEditButton from '../components/Hub/HubEditButton';
import HubResources from '../components/Hub/HubResources';
import HubDescription from '../components/Hub/HubDescription';
import HubStore from '../stores/HubStore';
import HubActions from '../actions/HubActions';
import MessageActions from '../actions/MessageActions';
import NotificationActions from '../actions/NotificationActions';
import Notification from '../components/Notification';
import Message from '../components/message';
import Confirmation from '../components/confirmation';
import Footer from '../components/footer';
import Progress from '../components/Progress';
import MapHubsComponent from '../components/MapHubsComponent';
import Reflux from '../components/Rehydrate';
import LocaleStore from '../stores/LocaleStore';
import type {LocaleStoreState} from '../stores/LocaleStore';
import type {HubStoreState} from '../stores/HubStore';

type Props = {
  hub: Object,
  map: Object,
  layers: Array<Object>,
  stories: Array<Object>,
  canEdit: boolean,
  myMaps: Array<Object>,
  popularMaps: Array<Object>,
  locale: string,
  _csrf: string,
  footerConfig: Object,
  mapConfig: Object
}

type DefaultProps = {
  hub: Object,
   layers: Array<Object>,
  stories: Array<Object>,
  canEdit: boolean
}

type State = {
  editing: boolean
} & LocaleStoreState & HubStoreState

export default class HubInfo extends MapHubsComponent<Props, State> {

  props: Props

  static defaultProps: DefaultProps = {
    hub: {
      name: "Unknown"
    },
    layers: [],
    stories: [],
    canEdit: false
  }

  state: State = {
    editing: false,
    hub: {}
  }

  constructor(props: Props){
		super(props);
    this.stores.push(HubStore);
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf});
    Reflux.rehydrate(HubStore, {hub: this.props.hub, map: this.props.map, layers: this.props.layers, stories: this.props.stories, canEdit: this.props.canEdit});
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
    HubActions.saveHub(this.state._csrf, (err) => {
      if(err){
        MessageActions.showMessage({title: _this.__('Server Error'), message: err});
      }else{
        NotificationActions.showNotification({message: _this.__('Hub Saved')});
        _this.setState({editing: false});
        window.location.reload(true);
      }
    });
  }

  publish = () => {
    var _this = this;
    if(this.state.unsavedChanges){
      MessageActions.showMessage({title: _this.__('Unsaved Changes'), message: _this.__('Please save your changes before publishing.')});
    }else if(isEmpty(this.state.hub.name) || isEmpty(this.state.hub.description)
            || !this.state.hub.hasLogoImage || !this.state.hub.hasBannerImage){
      MessageActions.showMessage({title: _this.__('Required Content'), message: _this.__('Please complete your hub before publishing. Add a title, description, logo image, and banner image. \n We also recommend adding map layers and publishing your first story.')});
    }else {
      HubActions.publish(this.state._csrf, (err) => {
        if(err){
          MessageActions.showMessage({title: _this.__('Server Error'), message: err});
        }else{
          NotificationActions.showNotification({message: _this.__('Hub Published')});
        }
      });
    }
  }

  render() {

    var editButton;
    var publishButton;
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

    var linkBaseUrl = '/hub/' + this.props.hub.hub_id + '/';

    return (
      <div>
        <HubNav hubid={this.props.hub.hub_id} canEdit={this.props.canEdit}/>
        <main  style={{marginTop: '0px'}}>
          
          <div className="row no-margin">
            <HubBanner editing={this.state.editing} hubid={this.props.hub.hub_id}/>
          </div>
          <div className="row">
              
          <div className="row" style={{height: 'calc(100vh - 65px)'}}>
            <HubMap editing={this.state.editing} height="calc(100vh - 65px)" 
            hub={this.state.hub} myMaps={this.props.myMaps} popularMaps={this.props.popularMaps}
            mapConfig={this.props.mapConfig}
            border/>          
          </div>
          <div className="row no-margin">
            <HubDescription editing={this.state.editing} hubid={this.props.hub.hub_id}/>
          </div>
              <div className="row">
                <a href={linkBaseUrl + 'stories'}><h5 className="hub-section center-align" style={{marginLeft: '10px'}}>{this.__('Stories')}</h5></a>
                <div className="divider" />
                <div className="container">
                  <HubStories hub={this.props.hub}
                    editing={this.state.editing}
                    stories={this.props.stories} limit={3}/>
                 
                </div>
                <div className="center-align" style={{marginTop: '10px', marginBottom:'10px'}}>
                  <a href={linkBaseUrl + 'stories'} className="btn">{this.__('View More Stories')}</a>
                </div>
              </div>
              <div className="row" style={{minHeight: '200px'}}>
                <a href={linkBaseUrl + 'resources'}><h5 className="hub-section center-align" style={{marginLeft: '10px'}}>{this.__('Resources')}</h5></a>
                <div className="divider" />
                <div className="container">
                  <HubResources editing={this.state.editing} />                  
                </div>
                <div className="center-align" style={{marginTop: '10px', marginBottom:'10px'}}>
                    <a href={linkBaseUrl + 'resources'} className="btn">{this.__('View Resources')}</a>
                  </div>
              </div>
            </div>


          {editButton}
          <Footer {...this.props.footerConfig}/>
          {publishButton}
        </main>

        <Notification />
        <Message />
        <Confirmation />
        <Progress id="saving-hub" title={this.__('Saving')} subTitle="" dismissible={false} show={this.state.saving}/>
      </div>
    );
  }
}