//  @flow
import React from 'react';
import MapHubsPureComponent from '../MapHubsPureComponent';
import slugify from 'slugify';

type Props = {
  mhid: string,
  layerID: number,
  layerName: string,
  disable_export: Boolean,
  data_type: String
}

export default class FeatureExport extends MapHubsPureComponent<Props, void> {
  render(){
    let {mhid, layer_id, name, disable_export, data_type} = this.props;
    
    const geoJSONURL = `/api/feature/json/${layer_id}/${mhid}/${slugify(this._o_(name))}.geojson`;
    const kmlURL = `/api/feature/${layer_id}/${mhid}/export/kml/${slugify(this._o_(name))}.kml`;
    
    if(!disable_export){
      let gpxExport;
      if(data_type === 'polygon'){
        const gpxLink = `/api/feature/gpx/${layer_id}/${mhid}/feature.gpx`;
        gpxExport = (
          <li className="collection-item">{this.__('GPX:')} <a href={gpxLink}>{gpxLink}</a></li>
        );
      }
      return (
        <div>
          <ul className="collection with-header">
           <li className="collection-header"><h5>{this.__('Export Data')}</h5></li>
           <li className="collection-item">{this.__('GeoJSON:')} <a href={geoJSONURL}>{geoJSONURL}</a></li>
           <li className="collection-item">{this.__('KML:')} <a href={kmlURL}>{kmlURL}</a></li>
           {gpxExport}
          </ul>
        </div>
      );
    }else{
      return (
        <div>
          <p>{this.__('Export is not available for this layer.')}</p>
        </div>
      );
    }
  }
}