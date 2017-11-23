//@flow
import React from 'react';
var $ = require('jquery');
import InteractiveMap from '../components/InteractiveMap';
import Header from '../components/header';
//var NotificationActions = require('../actions/NotificationActions');
import ConfirmationActions from '../actions/ConfirmationActions';
import NotificationActions from '../actions/NotificationActions';
import MessageActions from '../actions/MessageActions';
import MapMakerActions from '../actions/MapMakerActions';
import Progress from '../components/Progress';
import urlUtil from '../services/url-util';
import UserStore from '../stores/UserStore';
import request from 'superagent';
var checkClientError = require('../services/client-error-response').checkClientError;
import MapMakerStore from '../stores/MapMakerStore';

import debounce from 'lodash.debounce';
import MapHubsComponent from '../components/MapHubsComponent';
import Reflux from '../components/Rehydrate';
import LocaleStore from '../stores/LocaleStore';
import fireResizeEvent from '../services/fire-resize-event';
import type {LocaleStoreState} from '../stores/LocaleStore';
import type {UserStoreState} from '../stores/UserStore';
import BaseMapStore from '../stores/map/BaseMapStore';
import PublicShareModal from '../components/InteractiveMap/PublicShareModal';
import CopyMapModal from '../components/InteractiveMap/CopyMapModal';
let clipboard;
if(process.env.APP_ENV === 'browser'){
 clipboard = require('clipboard-polyfill');
}

type Props = {
  map: Object,
  layers: Array<Object>,
  canEdit: boolean,
  locale: string,
  _csrf: string,
  headerConfig: Object,
  mapConfig: Object
}

type DefaultProps = {
  canEdit: boolean
}

type UserMapState = {
  width: number,
  height: number,
  downloading: boolean,
  layers: Array<Object>,
  share_id?: string
}



type State = LocaleStoreState & UserStoreState & UserMapState

export default class UserMap extends MapHubsComponent<Props, State> {

  props: Props

  static defaultProps: DefaultProps = {
    canEdit: false
  }

  state: State = {
    width: 1024,
    height: 600,
    downloading: false,
    layers: []
  }

  constructor(props: Props){
		super(props);
    this.stores.push(UserStore);
    this.stores.push(MapMakerStore);
    this.stores.push(BaseMapStore);
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf});
    if(props.mapConfig && props.mapConfig.baseMapOptions){
       Reflux.rehydrate(BaseMapStore, {baseMapOptions: props.mapConfig.baseMapOptions});
    }
    this.state.layers = props.layers;
    if(this.props.map.share_id){
      this.state.share_id = this.props.map.share_id;
    }
	}

  componentWillMount(){
    super.componentWillMount();
    var _this = this;

    if (typeof window === 'undefined') return; //only run this on the client

    function getSize(){
      // Get the dimensions of the viewport
      var width = Math.floor($(window).width());
      var height = $(window).height();
      //var height = Math.floor(width * 0.75); //4:3 aspect ratio
      //var height = Math.floor((width * 9)/16); //16:9 aspect ratio
      return {width, height};
    }

    var size = getSize();
    this.setState({
      width: size.width,
      height: size.height
    });

    $(window).resize(() => {
      debounce(() => {
      var size = getSize();
        _this.setState({
          width: size.width,
          height: size.height
        });
      }, 300);
    });
  }

  componentDidMount() {
    $(this.refs.mapLayersPanel).sideNav({
      menuWidth: 240, // Default is 240
      edge: 'left', // Choose the horizontal origin
      closeOnClick: true // Closes side-nav on <a> clicks, useful for Angular/Meteor
    });
  }

  componentWillReceiveProps(nextProps: Props){
    if(nextProps.layers && nextProps.layers.length !== this.state.layers.length){
      this.setState({layers: nextProps.layers});
    }
  }

  componentDidUpdate(){
    debounce(() => {
      fireResizeEvent();
    }, 300);
  }

  onMouseEnterMenu = () => {
    $('.user-map-tooltip').tooltip();
  }

  onDelete = () => {
    var _this = this;
    ConfirmationActions.showConfirmation({
      title: _this.__('Confirm Delete'),
      message: _this.__('Please confirm removal of ') + this._o_(this.props.map.title),
      onPositiveResponse(){
        MapMakerActions.deleteMap(_this.props.map.map_id, _this.state._csrf, (err) => {
          if(err){
            MessageActions.showMessage({title: _this.__('Server Error'), message: err});
          } else {
            window.location = '/maps';
          }

        });
      }
    });
  }

  onEdit = () => {
    window.location = '/map/edit/' + this.props.map.map_id;
    //CreateMapActions.showMapDesigner();
  }

  onFullScreen = () => {
    var fullScreenLink = `/api/map/${this.props.map.map_id}/static/render`;
    if(window.location.hash){
      fullScreenLink = fullScreenLink += window.location.hash;
    }
    window.location = fullScreenLink;
  }

  onMapChanged = () => {
    location.reload();
  }

  postToMedium = () => {
    alert('coming soon');
  }

  download = () => {
    var _this = this;
    if(!this.props.map.has_screenshot){
      //warn the user if we need to wait for the screenshot to be created
      this.setState({downloading: true});
      setTimeout(() => {_this.setState({downloading: false}); }, 15000);
    }
  }

  copyToClipboard = (val: string) => {
    clipboard.writeText(val);
  }

  showEmbedCode = () => {
    const baseUrl = urlUtil.getBaseUrl();
    let url;
    if(this.props.map.share_id){
      url = `${baseUrl}/map/public-embed/${this.props.map.share_id}/static`;
    }else{
      url = `${baseUrl}/map/embed/${this.props.map.map_id}/static`;
    }

    var code = `
      &lt;iframe src="${url}"
        style="width: 100%; height: 350px;" frameborder="0" 
        allowFullScreen="true" webkitallowfullscreen="true" mozallowfullscreen="true"
        &gt;
      &lt;/iframe&gt;
    `;
    var messageIntro =  this.__('Paste the following code into your website to embed a map:');
     var message = `<p>${messageIntro}</p><pre style="height: 200px; overflow: auto">${code}</pre>`;

    MessageActions.showMessage({title: this.__('Embed Code'), message});
  }

  showSharePublic = () => {
    //show modal
    this.refs.publicShareModal.show();
  } 

  toggleSharePublic = (value: boolean) => {
    var _this = this;
    MapMakerActions.setPublic(this.props.map.map_id, value, this.state._csrf, (share_id) => {
      _this.setState({share_id});
    });
  }

  showCopyMap = () => {
    //show modal
    this.refs.copyMapModal.show();
  } 

  onCopyMap = (formData: Object, cb: Function) => {
    var _this = this;
    const data = {
      map_id: this.props.map.map_id, 
      title: formData.title,
      group_id: formData.group,
      _csrf: this.state._csrf,
    };

    request.post('/api/map/copy')
    .type('json').accept('json')
    .send(data)
    .end((err, res) => {
      checkClientError(res, err, (err) => {
          if(err || !res.body || !res.body.map_id){
            MessageActions.showMessage({title: _this.__('Error'), message: err});
          }else{
            var map_id = res.body.map_id;
            var url = '/map/edit/' + map_id;
            NotificationActions.showNotification({
              message: _this.__('Map Copied'),
              dismissAfter: 2000,
              onDismiss(){
                cb();
                window.location = url;
              }
            });
          }
      },
      (cb) => {
        cb();
      });
    });
  }

  render() {
    let map = '';
    let button = '', deleteButton = '', editButton ='', shareButton = '';
    if(this.props.canEdit){
      deleteButton = (
          <li>
            <a onClick={this.onDelete} className="btn-floating user-map-tooltip red"
              data-delay="50" data-position="left" data-tooltip={this.__('Delete Map')}>
              <i className="material-icons">delete</i>
            </a>
          </li>
        );
      editButton = (
          <li>
            <a onClick={this.onEdit} className="btn-floating user-map-tooltip blue"
              data-delay="50" data-position="left" data-tooltip={this.__('Edit Map')}>
              <i className="material-icons">mode_edit</i>
            </a>
          </li>
        );

     
    if(MAPHUBS_CONFIG.mapHubsPro){
      shareButton = (
        <li>
          <a onClick={this.showSharePublic} className="btn-floating user-map-tooltip"
            data-delay="50" data-position="left" data-tooltip={this.__('Share')}>
            <i className="material-icons">share</i>
          </a>
        </li>
      );
    }

    }

    var copyButton = '';
    if(this.state.loggedIn && this.state.user){
      copyButton = (
        <li>
          <a onClick={this.showCopyMap} className="btn-floating user-map-tooltip purple"
            data-delay="50" data-position="left" data-tooltip={this.__('Copy Map')}>
            <i className="material-icons">queue</i>
          </a>
        </li>
      );
    }

    let download= `${this._o_(this.props.map.title)} - ${MAPHUBS_CONFIG.productName}.png`; 
    let downloadHREF = `/api/screenshot/map/${this.props.map.map_id}.png`;

    button = (
    <div id="user-map-button" className="fixed-action-btn" style={{bottom: '40px'}}
      onMouseEnter={this.onMouseEnterMenu}
      >
      <a className="btn-floating btn-large">
        <i className="large material-icons">more_vert</i>
      </a>
      <ul>
        {shareButton}
        {deleteButton}
        {editButton}
        {copyButton}
        <li>
          <a onClick={this.download} 
            download={download} href={downloadHREF}
            className="btn-floating user-map-tooltip green"
            data-delay="50" data-position="left" data-tooltip={this.__('Get Map as a PNG Image')}>
            <i className="material-icons">insert_photo</i>
          </a>
        </li>
        <li>
          <a onClick={this.showEmbedCode} className="btn-floating user-map-tooltip orange"
            data-delay="50" data-position="left" data-tooltip={this.__('Embed')}>
            <i className="material-icons">code</i>
          </a>
        </li>
         <li>
          <a onClick={this.onFullScreen} className="btn-floating user-map-tooltip yellow"
            data-delay="50" data-position="left" data-tooltip={this.__('Print/Screenshot')}>
            <i className="material-icons">print</i>
          </a>
        </li>

      </ul>
    </div>
  );

  /*
  <li>
    <a onClick={this.postToMedium} className="btn-floating tooltipped user-map-tooltip purple"
      data-delay="50" data-position="left" data-tooltip={this.__('Post to Medium.com')}>
      <i className="material-icons">publish</i>
    </a>
  </li>
  */

  const copyMapTitle = JSON.parse(JSON.stringify(this.props.map.title));
  copyMapTitle.en = copyMapTitle.en + ' - Copy';
  //TODO: change copied map title in other languages

    map = (
      <InteractiveMap height="calc(100vh - 50px)" 
             {...this.props.map}         
             layers={this.props.layers}
             mapConfig={this.props.mapConfig}
             disableScrollZoom={false}
             {...this.props.map.settings}
             >
        {button}
        </InteractiveMap> 
    );

    return (
      <div>
        <Header {...this.props.headerConfig}/>
        <main style={{height: 'calc(100% - 50px)', marginTop: 0}}>
          <Progress id="load-data-progess" title={this.__('Preparing Download')} subTitle={''} dismissible={false} show={this.state.downloading}/>         
          {map}
          <PublicShareModal ref="publicShareModal" share_id={this.state.share_id} onChange={this.toggleSharePublic} />
          <CopyMapModal ref="copyMapModal" title={copyMapTitle} onSubmit={this.onCopyMap} />
        </main>
      </div>
    );
  }
}