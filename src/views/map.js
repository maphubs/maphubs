//@flow
import React from 'react';
import Header from '../components/header';
import MapMaker from '../components/MapMaker/MapMaker';
var slug = require('slug');
import MapHubsComponent from '../components/MapHubsComponent';
import Reflux from '../components/Rehydrate';
import LocaleStore from '../stores/LocaleStore';

export default class Map extends MapHubsComponent {

  props: {
    popularLayers: Array<Object>,
    myLayers: Array<Object>,
    myGroups: Array<Object>,
    editLayer: Object,
    locale: string,
    _csrf: string
  }

  static defaultProps = {
    popularLayers: [],
    myLayers: [],
    user: {}
  }

  constructor(props: Object) {
    super(props);
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf});
  }

  mapCreated = (map_id: number, title: string) => {
    window.location = '/map/view/' + map_id + '/'+ slug(title);
  }

	render() {
		return (
      <div>
        <Header activePage="map"/>
        <main style={{height: 'calc(100% - 70px)'}}>
          <MapMaker 
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