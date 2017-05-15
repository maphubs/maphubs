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

import type {Layer} from '../stores/layer-store';

type Props = {
  map: Object,
  layers: Array<Layer>,
  isStatic: boolean,
  interactive: boolean,
  locale: string,
  geoJSONUrl: string,
  markerColor: string,
  _csrf: string
}

type DefaultProps = {
  isStatic: boolean,
  interactive: boolean,
  markerColor: string
}

type State = {
  interactive: boolean,
  bounds: ?Object,
  glStyle: Object
}

export default class EmbedMap extends MapHubsComponent<DefaultProps, Props, State> {

  props: Props

  static defaultProps: DefaultProps = {
    isStatic: false,
    interactive: false,
    markerColor: '#FF0000'
  }

  state: State

  constructor(props: Props){
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
      interactive: this.props.interactive,
      bounds: null,
      glStyle
    };
	}
 
  componentDidMount(){
    $('.embed-tooltips').tooltip();

    if(this.props.geoJSONUrl){
      this.loadGeoJSON(this.props.geoJSONUrl);
    }
  }

  componentDidUpdate(prevState: State){
    if(this.state.interactive && !prevState.interactive){
      $(this.refs.mapLayersPanel).sideNav();
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
  
  render() {
    var map = '';
    var title = null;
    if(this.props.map.title){
      title = this.props.map.title;
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
         <InteractiveMap ref="interactiveMap" height="100%"    
                  interactive={this.state.interactive}    
                  fitBounds={bounds}
                  fitBoundsOptions={{animate: false, padding: 200, maxZoom: 8}}
                  style={this.state.glStyle} 
                  layers={this.props.layers}
                  map_id={this.props.map.map_id}
                  disableScrollZoom={true}
                  title={title}
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