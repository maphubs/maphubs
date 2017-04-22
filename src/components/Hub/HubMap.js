//#flow
import React from 'react';
//var debug = require('../../services/debug')('CreateMap');
var $ = require('jquery');
import InteractiveMap from '../InteractiveMap';
import  HubStore from '../../stores/HubStore';
import  HubActions from '../../actions/HubActions';
import  AddMapModal from '../Story/AddMapModal';
import MapHubsComponent from '../../components/MapHubsComponent';

export default class HubMap extends MapHubsComponent {

  props: {
    hub: PropTypes.object.isRequired,
    editing: PropTypes.bool,
    height: PropTypes.string,
    border: PropTypes.bool,
    myMaps: PropTypes.array,
    popularMaps: PropTypes.array
  }

  static defaultProps: {
    editing: false,
    height: '300px',
    border: false,
    myMaps: [],
    popularMaps: []
  }

  constructor(props: Object){
		super(props);
    this.stores.push(HubStore);
	}

  componentDidMount() {
    $(this.refs.mapLayersPanel).sideNav({
      menuWidth: 240, // Default is 240
      edge: 'left', // Choose the horizontal origin
      closeOnClick: true // Closes side-nav on <a> clicks, useful for Angular/Meteor
    });
  }

  componentDidUpdate(){
    var evt = document.createEvent('UIEvents');
    evt.initUIEvent('resize', true, false, window, 0);
    window.dispatchEvent(evt);
  }

  onSetMap(map){
    HubActions.setMap(map);
  }

  showMapSelection(){
    this.refs.addmap.show();
  }

  render() {

    //TODO: if map is set, show the map, otherwise show instruction to set a map

    var mapEditButton = '', selectMap = '';
    if(this.props.editing){
      selectMap = (
         <AddMapModal ref="addmap"
         onAdd={this.onSetMap.bind(this)} onClose={this.onMapCancel.bind(this)}
         myMaps={this.props.myMaps} popularMaps={this.props.popularMaps} />
      );
      if(this.state.map){
         mapEditButton = (
          <a className="btn omh-color white-text" onClick={this.showMapSelection.bind(this)}
            style={{position: 'absolute', top: '5px', left: '45%'}}>
            {this.__('Change Map')}
          </a>
        );
      }else{
       mapEditButton = (
        <a className="btn omh-color white-text" onClick={this.showMapSelection.bind(this)}
          style={{position: 'absolute', top: '45%', left: '45%'}}>
          {this.__('Select a Map')}
        </a>
      );
      }
     
    }
 
    return (
      <div style={{width: '100%', height: this.props.height, overflow: 'hidden'}}>
        <div className="row no-margin" style={{height: '100%', position: 'relative'}}>

          <InteractiveMap {...this.state.map} 
            height={this.props.height} showTitle={false}
            layers={this.state.layers} />
          
            {mapEditButton}

        </div>
        {selectMap}
      </div>
    );
  }
}