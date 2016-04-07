var React = require('react');
var $ = require('jquery');
var Legend = require('../components/Map/Legend');
var Map = require('../components/Map/Map');
var Header = require('../components/header');
//var NotificationActions = require('../actions/NotificationActions');
var ConfirmationActions = require('../actions/ConfirmationActions');
var MessageActions = require('../actions/MessageActions');
var CreateMap = require('../components/CreateMap/CreateMap');
var CreateMapActions = require('../actions/CreateMapActions');
import Progress from '../components/Progress';
var config = require('../clientconfig');
var urlUtil = require('../services/url-util');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');
var debounce = require('lodash.debounce');

var UserMap = React.createClass({

  mixins:[StateMixin.connect(LocaleStore, {initWithProps: ['locale']})],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    map: React.PropTypes.object.isRequired,
    layers: React.PropTypes.array.isRequired,
    canEdit: React.PropTypes.bool,
    locale: React.PropTypes.string.isRequired
  },

  getDefaultProps(){
    return {
      canEdit: false
    };
  },

  getInitialState(){
    return {
      width: 1024,
      height: 600,
      downloading: false
    };
  },

  componentWillMount(){
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

    $(window).resize(function(){
      var size = getSize();
      _this.setState({
        width: size.width,
        height: size.height
      });
    });


  },

  componentDidMount(){

  },

  componentDidUpdate(){
    $('.user-map-tooltip').tooltip();
    debounce(function(){
      var evt = document.createEvent('UIEvents');
      evt.initUIEvent('resize', true, false, window, 0);
      window.dispatchEvent(evt);
    }, 300);
  },

  onDelete(){
    var _this = this;
    ConfirmationActions.showConfirmation({
      title: _this.__('Confirm Delete'),
      message: _this.__('Please confirm removal of ') + this.props.map.title,
      onPositiveResponse(){
        CreateMapActions.deleteMap(_this.props.map.map_id, function(err){
          if(err){
            MessageActions.showMessage({title: _this.__('Server Error'), message: err});
          } else {
            window.location = '/maps';
          }

        });
      }
    });
  },

  onEdit(){
    CreateMapActions.showMapDesigner();
  },

  onMapChanged(){
    location.reload();
  },

  postToMedium(){
    alert('coming soon');
  },

  download(){
    var _this = this;
    if(!this.props.map.has_screenshot){
      //warn the user if we need to wait for the screenshot to be created
      this.setState({downloading: true});
      setTimeout(function(){_this.setState({downloading: false}); }, 15000);
    }

  },

  showEmbedCode(){
    var url = urlUtil.getBaseUrl(config.host, config.port) + '/map/embed/' + this.props.map.map_id + '/static';
    var code = '&lt;iframe src="' + url
    + '" style="width: 600px; height: 330px;" frameborder="0"&gt;&lt;/iframe&gt;';
    var message = '<p>' + this.__('Paste the following code into your website to embed a map:') + '</p><pre>' + code + '</pre>';
    MessageActions.showMessage({title: this.__('Embed Code'), message});
  },

  render() {
    var map = '';
    var title = null;

    if(this.props.map.title && this.props.map.title != ''){
      title = this.props.map.title;
    }

    var legend = '', bottomLegend = '';
    if(this.state.width < 600){
      bottomLegend = (
        <Legend style={{
            width: '100%'
          }}
            title={title}
            layers={this.props.layers}/>
        );
    } else {
      legend = (
        <Legend style={{
            position: 'absolute',
            top: '5px',
            left: '5px',
            minWidth: '275px',
            zIndex: '1',
            width: '25%'
          }}
          title={title}
            layers={this.props.layers}/>
      );
    }

    var button = '',  deleteButton = '', editButton ='', createMap='';
    if(this.props.canEdit){
      createMap = (
        <CreateMap onCreate={this.onMapChanged} mapLayers={this.props.layers}
          basemap={this.props.map.basemap}
          mapId={this.props.map.map_id} title={this.props.map.title} position={this.props.map.position} userMap/>
      );
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

    button = (
    <div id="user-map-button" className="fixed-action-btn">
      <a className="btn-floating btn-large">
        <i className="large material-icons">more_vert</i>
      </a>
      <ul>
        {deleteButton}
        {editButton}
        <li>
          <a onClick={this.download} download={'MapHubs-'+ this.props.map.title + '.png'} href={'/api/screenshot/map/' + this.props.map.map_id + '.png'}
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

    var bbox = this.props.map.position.bbox;
    var bounds = [bbox[0][0],bbox[0][1],bbox[1][0],bbox[1][1]];
    map = (
      <Map ref="map" fitBounds={bounds}
        style={{width: '100%', height: '100%'}}
        glStyle={this.props.map.style}
        baseMap={this.props.map.basemap}
         navPosition="top-right">
        {legend}
        <div className="addthis_sharing_toolbox" style={{position: 'absolute', bottom: '0px', left: '100px', zIndex:'1'}}></div>
        {button}
      </Map>
    );

    return (
      <div>
        <Header />
        <main style={{height: 'calc(100% - 50px)', marginTop: 0}}>
          <Progress id="load-data-progess" title={this.__('Preparing Download')} subTitle={''} dismissible={false} show={this.state.downloading}/>
          {createMap}
          <nav className="white hide-on-med-and-up"  style={{height: '0px', position: 'relative'}}>
          <a href="#" ref="mapLayersPanel"
            data-activates="user-map-layers"
            style={{position: 'absolute',
              top: '10px',
              left: '10px',
              height:'30px',

              lineHeight: '30px',
              textAlign: 'center',
              width: '30px'}}
            className="button-collapse">
            <i className="material-icons z-depth-1"
              style={{height:'30px',
                      lineHeight: '30px',
                      width: '30px',
                      color: '#29ABE2',
                      borderRadius: '4px',
                      backgroundColor: 'white',
                      borderColor: '#ddd',
                      borderStyle: 'solid',
                      borderWidth: '1px',
                      fontSize:'25px'}}
              >info</i>
          </a>
          <div className="side-nav" id="user-map-layers">
            {bottomLegend}

          </div>

        </nav>
          {map}

        </main>
      </div>
    );
  }
});

module.exports = UserMap;
