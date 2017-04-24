//@flow
import React from 'react';
var $ = require('jquery');
import MiniLegend from '../components/Map/MiniLegend';
import Map from '../components/Map/Map';
import _debounce from 'lodash.debounce';
import request from 'superagent';
var checkClientError = require('../services/client-error-response').checkClientError;
import _bbox from '@turf/bbox';
import MapHubsComponent from '../components/MapHubsComponent';
import Reflux from '../components/Rehydrate';
import LocaleStore from '../stores/LocaleStore';

export default class EmbedMap extends MapHubsComponent {

  props: {
    map: Object,
    layers: Array<Object>,
    isStatic: boolean,
    interactive: boolean,
    locale: string,
    geoJSONUrl: string,
    markerColor: string,
    _csrf: string
  }

  static defaultProps = {
    isStatic: false,
    interactive: false,
    markerColor: '#FF0000'
  }

  constructor(props: Object){
		super(props);
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf});

    var glStyle = this.props.map.style;
    if(this.props.geoJSONUrl){
      glStyle.sources['geojson-overlay'] = {
        type: 'geojson',
        data: this.props.geoJSONUrl
      };

      glStyle.layers.push({
      "id": "geojson-overlay",
      "type": "circle",
      "metadata": {
        "maphubs:layer_id": 0,
        "maphubs:interactive": false,
        "maphubs:showBehindBaseMapLabels": false,
        "maphubs:markers": {
          "shape": "MAP_PIN",
          "size": "32",
          "width": 32,
          "height": 32,
          "shapeFill": this.props.markerColor,
          "shapeFillOpacity": 0.75,
          "shapeStroke": "#FFFFFF",
          "shapeStrokeWidth": 2,
          "inverted": false,
          "enabled": true,
          "dataUrl": this.props.geoJSONUrl,
          "interactive": true
        }
      },
      "source": "geojson-overlay",
      "filter": [
        "in",
        "$type",
        "Point"
      ],
      "paint": {
        "circle-color": this.props.markerColor,
        "circle-opacity": 0.5
      }
    });
    }

    this.state = {
      retina: false,
      width: 1024,
      height: 600,
      interactive: this.props.interactive,
      bounds: null,
      glStyle
    };
	}

  componentWillMount(){
    super.componentWillMount();
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
      var debounced = _debounce(function(){
        var size = getSize();
        _this.setState({
          width: size.width,
          height: size.height
        });
      }, 2500).bind(this);
      debounced();
    });
  }

  componentDidMount(){
    $('.embed-tooltips').tooltip();

    if(this.props.geoJSONUrl){
      this.loadGeoJSON(this.props.geoJSONUrl);
    }
  }

  componentDidUpdate(prevState: Object){
    if(this.state.interactive && !prevState.interactive){
      $(this.refs.mapLayersPanel).sideNav();
    }
  }

  startInteractive(){
    this.setState({interactive: true});
    $('.embed-tooltips').tooltip('remove');
  }

  loadGeoJSON(url: string){
    var _this = this;
    request.get(url)
    .type('json').accept('json')
    .end(function(err, res){
      checkClientError(res, err, ()=>{}, function(){
        var geoJSON = res.body;
        var bounds = _bbox(geoJSON);
        //_this.refs.map.fitBounds(bounds, 12, 10, true);
        _this.setState({bounds});
      });
    });
  }
  
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
          <MiniLegend style={{
              width: '100%'
            }}
              title={title}
              layers={this.props.layers}/>
          );
      }else{
        legend = (
          <MiniLegend style={{
              position: 'absolute',
              top: '5px',
              left: '5px',
              minWidth: '275px',
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
 
    var bounds;
    

    if(this.props.isStatic && !this.state.interactive){
      var url = '/api/screenshot/map/' + this.props.map.map_id + '.png';
      map = (
          <div style={{position: 'relative'}}>
            <img src={url} className="responsive-img" alt={MAPHUBS_CONFIG.productName + ' Map'} />
              <a onClick={this.startInteractive} className="btn-floating waves-effect waves-light embed-tooltips"
                data-delay="50" data-position="right" data-tooltip={this.__('Start Interactive Map')}
                style={{position: 'absolute', left: '50%', bottom: '50%', backgroundColor: 'rgba(25,25,25,0.1)',  zIndex: '999'}}><i className="material-icons">play_arrow</i></a>
          </div>
        );
    }else {
       if(!this.state.bounds){
        var bbox = this.props.map.position.bbox;
        bounds = [bbox[0][0],bbox[0][1],bbox[1][0],bbox[1][1]];
      }else{
        bounds = this.state.bounds;
      }
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
              height: 'auto', padding: 0,
              border: 'none', boxShadow: 'none'}}>
            {bottomLegend}

          </div>

        </nav>
          <Map ref="map" interactive={this.state.interactive} 
            fitBounds={bounds} fitBoundsOptions={{animate: false, padding: 200, maxZoom: 8}}
            style={{width: '100%', height: mapHeight + 'px'}}
            glStyle={this.state.glStyle}
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
}