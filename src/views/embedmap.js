//@flow
import React from 'react';
var $ = require('jquery');
import InteractiveMap from '../components/InteractiveMap';
import request from 'superagent';
var checkClientError = require('../services/client-error-response').checkClientError;
import _bbox from '@turf/bbox';
import MapHubsComponent from '../components/MapHubsComponent';
import Reflux from '../components/Rehydrate';
import LocaleStore from '../stores/LocaleStore';
import BaseMapStore from '../stores/map/BaseMapStore';
import type {Layer} from '../stores/layer-store';
import type {GLStyle} from '../types/mapbox-gl-style';

type Props = {
  map: Object,
  layers: Array<Layer>,
  isStatic: boolean,
  interactive: boolean,
  locale: string,
  geoJSONUrl: string,
  markerColor: string,
  overlayName: LocalizedString,
  mapConfig: Object,
  showLogo: boolean,
  showScale: boolean,
  insetMap:  boolean,
  image: string,
  _csrf: string
}

type DefaultProps = {
  isStatic: boolean,
  interactive: boolean,
  markerColor: string,
  overlayName: string,
  showLogo: boolean,
  showScale: boolean,
  insetMap:  boolean,
}

type State = {
  interactive: boolean,
  bounds: ?Object,
  glStyle: Object,
  layers: Array<Layer>
}

export default class EmbedMap extends MapHubsComponent<DefaultProps, Props, State> {

  props: Props

  static defaultProps: DefaultProps = {
    isStatic: false,
    interactive: false,
    markerColor: '#FF0000',
    overlayName: 'Locations',
    showLogo: true,
    showScale: true,
    insetMap: true
  }

  state: State

  constructor(props: Props){
		super(props);
    this.stores.push(BaseMapStore);
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf});
    if(props.mapConfig && props.mapConfig.baseMapOptions){
       Reflux.rehydrate(BaseMapStore, {baseMapOptions: props.mapConfig.baseMapOptions});
    }
    
    var glStyle = this.props.map.style;
    let layers = this.props.layers;
    if(this.props.geoJSONUrl){
      glStyle.sources['geojson-overlay'] = {
        type: 'geojson',
        data: this.props.geoJSONUrl
      };

      glStyle.layers.push(this.getStyleLayer());
      layers.push(this.getLayerConfig());
    }

    this.state = {
      interactive: this.props.interactive,
      bounds: null,
      layers,
      glStyle
    };
	}
 
  componentDidMount(){
    $('.embed-tooltips').tooltip();

    if(this.props.geoJSONUrl){
      this.loadGeoJSON(this.props.geoJSONUrl);
    }
  }

  startInteractive = () => {
    this.setState({interactive: true});
    $('.embed-tooltips').tooltip('remove');
  }

  loadGeoJSON = (url: string) => {
    var _this = this;
    request.get(url)
    .type('json').accept('json')
    .end((err, res) => {
      checkClientError(res, err, ()=>{}, () => {
        var geoJSON = res.body;
        var bounds = _bbox(geoJSON);
        //_this.refs.map.fitBounds(bounds, 12, 10, true);
        _this.setState({bounds});
      });
    });
  }

  getStyleLayer = () => {
    return {
      "id": "omh-data-point-geojson-overlay",
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
        "circle-color": this.props.markerColor
      }
    };
  }

  getLayerConfig = (): Layer => {
    let emptyLocalizedString: LocalizedString = {en: '', fr: '', es: '', it: ''};

    let style: GLStyle = {
      version: 8,
      sources: {
        "geojson-overlay": {
          type: 'geojson',
          data: this.props.geoJSONUrl
      }
      },
      layers:[this.getStyleLayer()]
    };

    return {
        active: true,
        layer_id: -2,
        name: this.props.overlayName,
        source: emptyLocalizedString,
        description: emptyLocalizedString,
        owned_by_group_id: '',
        remote: true,
        is_external: true,
        external_layer_config: {},
        style,
        legend_html: `
        
        `
    };
  }
  
  render() {
    var map = '';
    
    var bounds;
    
    if(this.props.isStatic && !this.state.interactive){

      map = (
          <div style={{position: 'relative'}}>
            <img src={this.props.image} className="responsive-img" alt={MAPHUBS_CONFIG.productName + ' Map'} />
              <a onClick={this.startInteractive} className="btn-floating waves-effect waves-light embed-tooltips"
                data-delay="50" data-position="right" data-tooltip={this.__('Start Interactive Map')}
                style={{position: 'absolute', left: '50%', bottom: '50%', backgroundColor: 'rgba(25,25,25,0.1)',  zIndex: '999'}}><i className="material-icons">play_arrow</i></a>
          </div>
        );
    }else {
       if(!this.state.bounds){
          if(typeof window === 'undefined' || !window.location.hash){
              //only update position if there isn't absolute hash in the URL
                if( this.props.map.position && this.props.map.position.bbox){
                  var bbox = this.props.map.position.bbox;
                  bounds = [bbox[0][0],bbox[0][1],bbox[1][0],bbox[1][1]];
                }      
            }             
      }else{
        bounds = this.state.bounds;
      }

      let insetConfig = {};
  if(this.props.map.settings && this.props.map.settings.insetConfig){
    insetConfig = this.props.map.settings.insetConfig;
  }
  insetConfig.collapsible = false;


      map = (
         <InteractiveMap ref="interactiveMap" height="100vh"    
                  interactive={this.state.interactive}    
                  fitBounds={bounds}
                  fitBoundsOptions={{animate: false, padding: 0, maxZoom: 20}}
                  style={this.state.glStyle} 
                  layers={this.state.layers}
                  map_id={this.props.map.map_id}
                  disableScrollZoom={true}
                  mapConfig={this.props.mapConfig}
                  title={this.props.map.title}
                  insetConfig={insetConfig}
                  insetMap={this.props.insetMap}
                  showLogo={this.props.showLogo} 
                  showScale={this.props.showScale} 

                  {...this.props.map.settings}
                  >
          </InteractiveMap> 
      );
    }
    return (
      <div className="embed-map" style={{height: '100%'}}>
        {map}
      </div>
    );
  }
}