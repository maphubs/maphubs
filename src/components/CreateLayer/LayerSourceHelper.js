import React from 'react';
import UploadLocalSource  from './UploadLocalSource';
import EmptyLocalSource  from './EmptyLocalSource';
import MapboxSource  from './MapboxSource';
import RasterTileSource  from './RasterTileSource';
import VectorTileSource  from './VectorTileSource';
import GeoJSONUrlSource  from './GeoJSONUrlSource';
import AGOLSource  from './AGOLSource';
import PlanetLabsSource  from './PlanetLabsSource';

import '../../stores/preset-store'; //needed to init the store used by the source options

export default {

  getSource(type){
    if(type === 'local'){
      return (<UploadLocalSource showPrev={true} onPrev={this.onPrev} onSubmit={this.onSubmit} />);
    }else if(type === 'geojson'){
      return(<GeoJSONUrlSource showPrev={true} onPrev={this.onPrev} onSubmit={this.onSubmit} />);
    }else if(type === 'mapbox'){
      return (<MapboxSource showPrev={true} onPrev={this.onPrev} onSubmit={this.onSubmit} />);
    }else if(type === 'raster'){
      return(<RasterTileSource showPrev={true} onPrev={this.onPrev} onSubmit={this.onSubmit} />);
    }else if(type === 'vector'){
      return(<VectorTileSource showPrev={true} onPrev={this.onPrev} onSubmit={this.onSubmit} />);
    }else if(type === 'ags'){
      return(<AGOLSource showPrev={true} onPrev={this.onPrev} onSubmit={this.onSubmit} />);
    }else if(type === 'planet'){
      return(<PlanetLabsSource showPrev={true} onPrev={this.onPrev} onSubmit={this.onSubmit} />);
    }else if(type === 'remote'){
      return(
        <div style={{marginTop: '20px'}}>
          <a className="btn" href="/createremotelayer">{this.__('Go to Remote Layer Tool')}</a>
        </div>
      );
    }else if(type === 'point' || type === 'line' || type === 'polygon'){
      return (<EmptyLocalSource showPrev={true} type={type}
      onPrev={this.onPrev} onSubmit={this.onSubmit} />);
    }else{
      return '';
    }
  }
};