var React = require('react');
var $ = require('jquery');
var Header = require('../components/header');
var Map = require('../components/Map/Map');
var Legend = require('../components/Map/Legend');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');

var config = require('../clientconfig');

var LayerMap = React.createClass({

  mixins:[StateMixin.connect(LocaleStore, {initWithProps: ['locale']})],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    layer: React.PropTypes.object.isRequired,
    locale: React.PropTypes.string.isRequired
  },

  getInitialState(){
    return {
      width: 1024,
      height: 600
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

  componentDidUpdate(){
    var evt = document.createEvent('UIEvents');
    evt.initUIEvent('resize', true, false, window, 0);
    window.dispatchEvent(evt);
  },

	render() {

    var legend = '', bottomLegend = '';
    if(this.state.width < 600){
      bottomLegend = (
        <Legend style={{
            width: '100%'
          }}
          title={this.props.layer.name}
            layers={[this.props.layer]}/>
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
            title={this.props.layer.name}
            layers={[this.props.layer]}/>
      );
    }

		return (
      <div>
      <Header />
      <main style={{margin: 0}}>
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
                    color: config.primaryColor,
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
        <div className="row">
        <div className="col s12 no-padding">
          <Map className="map-absolute map-with-header width-full"
            navPosition="top-right"
            glStyle={this.props.layer.style}
            fitBounds={this.props.layer.preview_position.bbox}
            title={this.props.layer.name}>

            {legend}
            <div className="addthis_sharing_toolbox" style={{position: 'absolute', bottom: '0px', left: '100px', zIndex:'1'}}></div>
          </Map>
        </div>
       </div>
     </main>
      </div>

		);
	}
});

module.exports = LayerMap;
