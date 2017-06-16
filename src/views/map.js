//@flow
import React from 'react';
import Header from '../components/header';
import MapMaker from '../components/MapMaker/MapMaker';
var slug = require('slug');
import MapHubsComponent from '../components/MapHubsComponent';
import Reflux from '../components/Rehydrate';
import LocaleStore from '../stores/LocaleStore';
import BaseMapStore from '../stores/map/BaseMapStore';

type Props = {
  popularLayers: Array<Object>,
  myLayers: Array<Object>,
  myGroups: Array<Object>,
  editLayer: Object,
  headerConfig: Object,
  mapConfig: Object,
  locale: string,
  _csrf: string
}

type DefaultProps = {
  popularLayers: Array<Object>,
  myLayers: Array<Object>
}

export default class Map extends MapHubsComponent<DefaultProps, Props, void> {

  props: Props

  static defaultProps: DefaultProps = {
    popularLayers: [],
    myLayers: []
  }

  constructor(props: Props) {
    super(props);
    this.stores.push(BaseMapStore);
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf});
    if(props.mapConfig && props.mapConfig.baseMapOptions){
       Reflux.rehydrate(BaseMapStore, {baseMapOptions: props.mapConfig.baseMapOptions});
    }
  }

  mapCreated = (map_id: number, title: string) => {
    window.location = '/map/view/' + map_id + '/'+ slug(title);
  }

	render() {
		return (
      <div>
        <Header activePage="map" {...this.props.headerConfig}/>
        <main style={{height: 'calc(100% - 70px)'}}>
          <MapMaker 
            mapConfig={this.props.mapConfig}
            onCreate={this.mapCreated} 
            popularLayers={this.props.popularLayers} 
            myLayers={this.props.myLayers} 
            myGroups={this.props.myGroups}
            editLayer={this.props.editLayer}
             />
        </main>
      </div>
		);
	}
}