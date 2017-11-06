//@flow
import React from 'react';
import UploadLocalSource  from './UploadLocalSource';
import EmptyLocalSource  from './EmptyLocalSource';
import MapboxSource  from './MapboxSource';
import RasterTileSource  from './RasterTileSource';
import VectorTileSource  from './VectorTileSource';
import GeoJSONUrlSource  from './GeoJSONUrlSource';
import AGOLSource  from './AGOLSource';
import PlanetLabsSource  from './PlanetLabsSource';

export default {

  getSource(type: string, mapConfig: Object){
    if(type === 'local'){
      return (<UploadLocalSource showPrev={true} onPrev={this.onPrev} onSubmit={this.onSubmit} mapConfig={mapConfig} />);
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
        <div className="col s12 m6">
          <a className="btn" href="/createremotelayer">{this.__('Link a Remote Layer')}</a>
        </div>
        <div className="col s12 m6">
          <a className="btn" href="/importlayer">{this.__('Import MapHubs File')}</a>
        </div>
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