var React = require('react');
var $ = require('jquery');
var InteractiveMap = require('../components/InteractiveMap');
var Header = require('../components/header');
//var NotificationActions = require('../actions/NotificationActions');
var ConfirmationActions = require('../actions/ConfirmationActions');
var NotificationActions = require('../actions/NotificationActions');
var MessageActions = require('../actions/MessageActions');
var MapMakerActions = require('../actions/MapMakerActions');
import Progress from '../components/Progress';
var urlUtil = require('../services/url-util');
var UserStore = require('../stores/UserStore');

var request = require('superagent');
var checkClientError = require('../services/client-error-response').checkClientError;

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../stores/LocaleStore');
var MapMakerStore = require('../stores/MapMakerStore');
var Locales = require('../services/locales');
var debounce = require('lodash.debounce');
var ForestLossLegendHelper = require('../components/Map/ForestLossLegendHelper');

var UserMap = React.createClass({

  mixins:[StateMixin.connect(UserStore), StateMixin.connect(MapMakerStore), StateMixin.connect(LocaleStore, {initWithProps: ['locale', '_csrf']})],

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
      downloading: false,
      layers: this.props.layers
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
      debounce(function(){
      var size = getSize();
        _this.setState({
          width: size.width,
          height: size.height
        });
      }, 300);
    });


  },

  onMouseEnterMenu(){
    $('.user-map-tooltip').tooltip();
  },

  componentDidMount() {
  $(this.refs.mapLayersPanel).sideNav({
    menuWidth: 240, // Default is 240
    edge: 'left', // Choose the horizontal origin
    closeOnClick: true // Closes side-nav on <a> clicks, useful for Angular/Meteor
  });

},

componentWillReceiveProps(nextProps){
  if(nextProps.layers && nextProps.layers.length !== this.state.layers.length){
    this.setState({layers: nextProps.layers});
  }
},

  componentDidUpdate(){
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
        MapMakerActions.deleteMap(_this.props.map.map_id, _this.state._csrf, function(err){
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
    window.location = '/map/edit/' + this.props.map.map_id;
    //CreateMapActions.showMapDesigner();
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
    var url = urlUtil.getBaseUrl() + '/map/embed/' + this.props.map.map_id + '/static';
    var code = '&lt;iframe src="' + url
    + '" style="width: 600px; height: 330px;" frameborder="0"&gt;&lt;/iframe&gt;';
    var message = '<p>' + this.__('Paste the following code into your website to embed a map:') + '</p><pre>' + code + '</pre>';
    MessageActions.showMessage({title: this.__('Embed Code'), message});
  },

  onCopyMap(){
    var _this = this;
    request.post('/api/map/copy')
    .type('json').accept('json')
    .send({map_id: this.props.map.map_id, _csrf: _this.state._csrf})
    .end(function(err, res){
      checkClientError(res, err, function(err){
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
      function(cb){
        cb();
      });
    });
  },

  onToggleForestLoss(enabled){
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
  },

  render() {
    var map = '';
   
/*
    var legend = '', bottomLegend = '';
    if(this.state.width < 600){
      bottomLegend = (
        <MiniLegend style={{
            width: '100%',
            maxHeight: 'calc(100% - 140px)',
            display: 'flex',
            flexDirection: 'column'
          }}
          collapsible={false}
            title={title}
            layers={this.state.layers}/>
        );
    } else {
      legend = (
        <MiniLegend style={{
            position: 'absolute',
            top: '5px',
            left: '5px',
            minWidth: '275px',
            zIndex: '1',
            width: '25%',
            maxWidth: '325px',
            maxHeight: 'calc(100% - 200px)',
            display: 'flex',
            flexDirection: 'column'
          }}
          title={title}
            layers={this.state.layers}/>
      );
    }
    */

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
});

module.exports = UserMap;

/*

 <nav className="hide-on-med-and-up grey-text text-darken-4"  style={{height: '0px', position: 'relative'}}>
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
                      color: MAPHUBS_CONFIG.primaryColor,
                      borderRadius: '4px',
                      backgroundColor: 'white',
                      borderColor: '#ddd',
                      borderStyle: 'solid',
                      borderWidth: '1px',
                      fontSize:'25px'}}
              >info</i>
          </a>
          <div className="side-nav" id="user-map-layers"
            style={{backgroundColor: 'rgba(0,0,0,0)',
              height: 'calc(100% - 100px)', padding: 0, marginTop: '100px',
              border: 'none', boxShadow: 'none'}}>
            {bottomLegend}

          </div>

        </nav>

        */
