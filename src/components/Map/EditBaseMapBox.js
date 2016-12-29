var React = require('react');
var Actions = require('../../actions/map/BaseMapActions');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var BaseMapStore = require('../../stores/map/BaseMapStore');
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');


var EditBaseMapBox = React.createClass({

  mixins:[StateMixin.connect(BaseMapStore), StateMixin.connect(LocaleStore)],

  __(text: string){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    gpxLink: React.PropTypes.string
  },

  render(){
      
      if(this.state.showEditBaseMap){
         var origHash = window.location.hash.replace('#', '');
          var hashParts = origHash.split('/');
          var zoom =  Math.round(hashParts[0]);
          var lon = hashParts[1];
          var lat = hashParts[2];
          var osmEditLink = 'https://www.openstreetmap.org/edit#map=' + zoom + '/' + lon + '/' + lat;
          var loggingRoadsEditLink = 'http://id.loggingroads.org/#map=' + zoom + '/' + lat + '/' + lon;
          if(this.props.gpxLink){
            osmEditLink += '&gpx=' + this.props.gpxLink;
            loggingRoadsEditLink +=  '&gpx=' + this.props.gpxLink;
          }
        return (
          <div className="features z-depth-1" style={{width: '240px', textAlign: 'center'}}>
            <ul className="collection with-header custom-scroll-bar" style={{margin: 0, width: '100%', overflow: 'auto'}}>
              <li className="collection-header">
                <h6>{this.__('Edit Base Map Data')}</h6>
              </li>
             <li className="collection-item">
               <a className="btn" target="_blank" href={osmEditLink} onClick={Actions.toggleEditBaseMap}>{this.__('OpenStreetMap')}</a>
             </li>
             <li className="collection-item">
               <a className="btn" target="_blank" href={loggingRoadsEditLink} onClick={Actions.toggleEditBaseMap}>{this.__('LoggingRoads')}</a>
             </li>
           </ul>
        </div>
        );
      }else{
        return null;
      }   
  }
});

module.exports = EditBaseMapBox;