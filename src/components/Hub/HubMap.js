//@flow
import React from 'react';
//var debug = require('../../services/debug')('CreateMap');
var $ = require('jquery');
import InteractiveMap from '../InteractiveMap';
import  HubStore from '../../stores/HubStore';
import  HubActions from '../../actions/HubActions';
import  AddMapModal from '../Story/AddMapModal';
import MapHubsComponent from '../../components/MapHubsComponent';
import fireResizeEvent from '../../services/fire-resize-event';

type Props = {|
  hub: Object,
  editing: boolean,
  height: string,
  border: boolean,
  myMaps: Array<Object>,
  popularMaps: Array<Object>,
  mapConfig: Object
|}

type DefaultProps = {
  editing: boolean,
  height: string,
  border: boolean,
  myMaps: Array<Object>,
  popularMaps: Array<Object>
}

import type {HubStoreState} from '../../stores/HubStore';

export default class HubMap extends MapHubsComponent<DefaultProps, Props, HubStoreState> {

  props: Props

  static defaultProps = {
    editing: false,
    height: '300px',
    border: false,
    myMaps: [],
    popularMaps: []
  }

  constructor(props: Props){
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
    fireResizeEvent();
  }

  onSetMap = (map: Object) => {
    HubActions.setMap(map);
  }

  showMapSelection = () => {
    this.refs.addmap.show();
  }

  onMapCancel = () => {
    this.refs.addmap.hide();
  }

  render() {

    //TODO: if map is set, show the map, otherwise show instruction to set a map

    var mapEditButton = '', selectMap = '';
    if(this.props.editing){
      selectMap = (
         <AddMapModal ref="addmap"
         onAdd={this.onSetMap} onClose={this.onMapCancel}
         myMaps={this.props.myMaps} popularMaps={this.props.popularMaps} />
      );
      if(this.state.map){
         mapEditButton = (
          <a className="btn omh-color white-text" onClick={this.showMapSelection}
            style={{position: 'absolute', top: '5px', left: '45%'}}>
            {this.__('Change Map')}
          </a>
        );
      }else{
       mapEditButton = (
        <a className="btn omh-color white-text" onClick={this.showMapSelection}
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
            mapConfig={this.props.mapConfig}
            height={this.props.height} showTitle={false}
            layers={this.state.layers} />
          
            {mapEditButton}

        </div>
        {selectMap}
      </div>
    );
  }
}