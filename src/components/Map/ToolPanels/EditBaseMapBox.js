//@flow
import React from 'react';
import MapHubsPureComponent from '../../MapHubsPureComponent';

type Props = {|
  gpxLink: string
|}

export default class EditBaseMapBox extends MapHubsPureComponent<Props, void> {

  props: Props

  getLinks = () => {
    const origHash = window.location.hash.replace('#', '');
      const hashParts = origHash.split('/');
      const zoom =  Math.round(hashParts[0]);
      const lon = hashParts[1];
      const lat = hashParts[2];
      let osmEditLink = 'https://www.openstreetmap.org/edit#map=' + zoom + '/' + lon + '/' + lat;
      let loggingRoadsEditLink = 'http://id.loggingroads.org/#map=' + zoom + '/' + lat + '/' + lon;
      if(this.props.gpxLink){
        osmEditLink += '&gpx=' + this.props.gpxLink;
        loggingRoadsEditLink +=  '&gpx=' + this.props.gpxLink;
      }
      return {
        osm: osmEditLink,
        loggingroads: loggingRoadsEditLink
      };
  }

  openOSM = () => {
    const links = this.getLinks();
    window.location = links.osm;
  }

  openLoggingRoads = () =>{
    const links = this.getLinks();
    window.location = links.loggingroads;
  }

  render(){

      return (
        <div style={{width: '100%', textAlign: 'center'}}>
          <p style={{padding: '5px'}}>Edit OpenStreetMap at this location</p>
          <ul className="collection with-header custom-scroll-bar" style={{margin: 0, width: '100%', overflow: 'auto'}}>
            <li className="collection-item" style={{paddingLeft: 0}}>
              <a className="btn" onClick={this.openOSM}>{this.__('OpenStreetMap')}</a>
            </li>
            <li className="collection-item" style={{paddingLeft: 0}}>
              <a className="btn" onClick={this.openLoggingRoads}>{this.__('LoggingRoads')}</a>
            </li>
          </ul>
      </div>
    ); 
  }
}