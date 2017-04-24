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
import ForestLossLegendHelper from '../components/Map/ForestLossLegendHelper';
import MapHubsComponent from '../components/MapHubsComponent';
import Reflux from '../components/Rehydrate';
import LocaleStore from '../stores/LocaleStore';

export default class UserMap extends MapHubsComponent {

  props: {
    map: Object,
    layers: Array<Object>,
    canEdit: boolean,
    locale: string,
    _csrf: string
  }

  static defaultProps = {
    canEdit: false
  }

  state = {
      width: 1024,
      height: 600,
      downloading: false,
      layers: []
  }

  constructor(props: Object){
		super(props);
    this.stores.push(UserStore);
    this.stores.push(MapMakerStore);
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf});
    this.state.layers = props.layers;
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

  componentWillReceiveProps(nextProps: Object){
    if(nextProps.layers && nextProps.layers.length !== this.state.layers.length){
      this.setState({layers: nextProps.layers});
    }
  }

  componentDidUpdate(){
    debounce(() => {
      var evt = document.createEvent('UIEvents');
      evt.initUIEvent('resize', true, false, window, 0);
      window.dispatchEvent(evt);
    }, 300);
  }

  onMouseEnterMenu = () => {
    $('.user-map-tooltip').tooltip();
  }

  onDelete = () => {
    var _this = this;
    ConfirmationActions.showConfirmation({
      title: _this.__('Confirm Delete'),
      message: _this.__('Please confirm removal of ') + this.props.map.title,
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

  showEmbedCode = () => {
    var url = urlUtil.getBaseUrl() + '/map/embed/' + this.props.map.map_id + '/static';
    var code = `
      &lt;iframe src="${url}"
        style="width: 600px; height: 330px;" frameborder="0"&gt;
      &lt;/iframe&gt;
    `;
    var messageIntro =  this.__('Paste the following code into your website to embed a map:');
     var message = `<p>${messageIntro}</p><pre style="height: 200px; overflow: auto">${code}</pre>`;

    MessageActions.showMessage({title: this.__('Embed Code'), message});
  }

  onCopyMap = () => {
    var _this = this;
    request.post('/api/map/copy')
    .type('json').accept('json')
    .send({map_id: this.props.map.map_id, _csrf: _this.state._csrf})
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

  onToggleForestLoss = (enabled: boolean) => {
    var mapLayers = this.state.layers;
    var layers = ForestLossLegendHelper.getLegendLayers();
  
    if(enabled){
      //add layers to legend
       mapLayers = mapLayers.concat(layers);
    }else{
      var updatedLayers = [];
      //remove layers from legend
      mapLayers.forEach(mapLayer=>{
        var foundInLayers;
        layers.forEach(layer=>{
          if(mapLayer.id === layer.id){
            foundInLayers = true;
          }
        });
        if(!foundInLayers){
          updatedLayers.push(mapLayer);
        }
      });    
      mapLayers = updatedLayers;
    }
   this.setState({layers: mapLayers});
  }

  render() {
    var map = '';
    var button = '',  deleteButton = '', editButton ='';
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

    }

    var copyButton = '';
    if(this.state.loggedIn && this.state.user){
      copyButton = (
        <li>
          <a onClick={this.onCopyMap} className="btn-floating user-map-tooltip purple"
            data-delay="50" data-position="left" data-tooltip={this.__('Copy Map')}>
            <i className="material-icons">queue</i>
          </a>
        </li>
      );
    }

    button = (
    <div id="user-map-button" className="fixed-action-btn" style={{bottom: '40px'}}
      onMouseEnter={this.onMouseEnterMenu}
      >
      <a className="btn-floating btn-large">
        <i className="large material-icons">more_vert</i>
      </a>
      <ul>
        {deleteButton}
        {editButton}
        {copyButton}
        <li>
          <a onClick={this.download} download={this.props.map.title + ' - ' + MAPHUBS_CONFIG.productName + '.png'} href={'/api/screenshot/map/' + this.props.map.map_id + '.png'}
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
            data-delay="50" data-position="left" data-tooltip={this.__('Full Screen')}>
            <i className="material-icons">fullscreen</i>
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

    map = (
      <InteractiveMap height="100%" 
             {...this.props.map}         
             layers={this.props.layers}
             disableScrollZoom={false}
             >
        <div className="addthis_sharing_toolbox" style={{position: 'absolute', bottom: '0px', left: '155px', zIndex:'1'}}></div>
        {button}
        </InteractiveMap> 
    );

    return (
      <div>
        <Header />
        <main style={{height: 'calc(100% - 50px)', marginTop: 0}}>
          <Progress id="load-data-progess" title={this.__('Preparing Download')} subTitle={''} dismissible={false} show={this.state.downloading}/>         
          {map}
        </main>
      </div>
    );
  }
}