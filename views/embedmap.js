var React = require('react');
var $ = require('jquery');
var Legend = require('../components/Map/Legend');
var Map = require('../components/Map/Map');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');

var config = require('../clientconfig');

var EmbedMap = React.createClass({

  mixins:[StateMixin.connect(LocaleStore, {initWithProps: ['locale']})],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    map: React.PropTypes.object.isRequired,
    layers: React.PropTypes.array.isRequired,
    isStatic: React.PropTypes.bool,
    locale: React.PropTypes.string.isRequired
  },

  getDefaultProps() {
    return {
      isStatic: false
    };
  },

  getInitialState(){
    return {
      retina: false,
      width: 1024,
      height: 600,
      interactive: false
    };
  },

  componentWillMount(){
    var _this = this;
    if (typeof window === 'undefined') return; //only run this on the client
    function isRetinaDisplay() {
        if (window.matchMedia) {
            var mq = window.matchMedia("only screen and (min--moz-device-pixel-ratio: 1.3), only screen and (-o-min-device-pixel-ratio: 2.6/2), only screen and (-webkit-min-device-pixel-ratio: 1.3), only screen  and (min-device-pixel-ratio: 1.3), only screen and (min-resolution: 1.3dppx)");
            return (mq && mq.matches || (window.devicePixelRatio > 1));
        }
    }
    //detect retina
    var retina = false;
    if (isRetinaDisplay()){
      retina = true;
    }

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
      retina,
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
    $('.embed-tooltips').tooltip();
  },

  componentDidUpdate(prevState){
    if(this.state.interactive && !prevState.interactive){
      $(".button-collapse").sideNav();
    }
  },

  startInteractive(){
    this.setState({interactive: true});
    $('.embed-tooltips').tooltip('remove');

  },

  render() {
    var map = '';

    //var legendHeight = 14 + (this.props.layers.length * 36);
    var mapHeight = this.state.height;

    var legend = '', bottomLegend = '';

    var title = null;
    if(this.props.map.title){
      title = this.props.map.title;
    }

    if(!this.props.isStatic || this.state.interactive){
      if(this.state.width < 600){
        //mapHeight = mapHeight - legendHeight;
        bottomLegend = (
          <Legend style={{
              width: '100%'
            }}
              title={title}
              layers={this.props.layers}/>
          );
      }else{
        legend = (
          <Legend style={{
              position: 'absolute',
              top: '5px',
              left: '5px',
              minWidth: '275px',
              zIndex: '9999',
              width: '25%',
              maxWidth: '325px',
              maxHeight: 'calc(100% - 200px)',
              display: 'flex',
              flexDirection: 'column'
            }}
              title={title}
              layers={this.props.layers}/>
        );
      }
    }

    if(this.props.isStatic && !this.state.interactive){
      var url = '/api/screenshot/map/' + this.props.map.map_id + '.png';
      map = (
          <div style={{position: 'relative'}}>
            <img src={url} className="responsive-img" alt={config.productName + ' Map'} />
              <a onClick={this.startInteractive} className="btn-floating waves-effect waves-light embed-tooltips"
                data-delay="50" data-position="right" data-tooltip={this.__('Start Interactive Map')}
                style={{position: 'absolute', left: '50%', bottom: '50%', backgroundColor: 'rgba(25,25,25,0.1)',  zIndex: '999'}}><i className="material-icons">play_arrow</i></a>
          </div>
        );
    }else {
      var bbox = this.props.map.position.bbox;
      var bounds = [bbox[0][0],bbox[0][1],bbox[1][0],bbox[1][1]];
      map = (
        <div>
          <nav className="hide-on-med-and-up grey-text text-darken-4"  style={{height: '0px', position: 'relative', backgroundColor: 'rgba(0,0,0,0)'}}>
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
          <div className="side-nav" id="user-map-layers"
            style={{backgroundColor: 'rgba(0,0,0,0)',
              height: 'auto', padding: 0,
              border: 'none', boxShadow: 'none'}}>
            {bottomLegend}

          </div>

        </nav>
          <Map ref="map" interactive={this.state.interactive} fitBounds={bounds}
            style={{width: '100%', height: mapHeight + 'px'}}
            glStyle={this.props.map.style}
            baseMap={this.props.map.basemap}
            navPosition="top-right" disableScrollZoom>
            {legend}
          </Map>
        </div>

      );
    }
    return (
      <div className="embed-map">

        {map}
      </div>
    );
  }
});

module.exports = EmbedMap;
