//@flow
import React from 'react';
import Header from '../components/header';
import MapMaker from '../components/MapMaker/MapMaker';
var slug = require('slug');
import MapHubsComponent from '../components/MapHubsComponent';
import LocaleActions from '../actions/LocaleActions';
import Rehydrate from 'reflux-rehydrate';
import LocaleStore from '../stores/LocaleStore';

export default class MapEdit extends MapHubsComponent {

  props: {
    map: Object,
    layers: Array<Object>,
    popularLayers:Array<Object>,
    myLayers: Array<Object>,
    myGroups: Array<Object>,
    locale: string,
    _csrf: string
  }

  static defaultProps: {
    popularLayers: [],
    myLayers: [],
    user: {}
  }

  componentWillMount() {
    Rehydrate.initStore(LocaleStore);
    LocaleActions.rehydrate({locale: this.props.locale, _csrf: this.props._csrf});
  }

  mapCreated(map_id, title){
    window.location = '/map/view/' + map_id + '/'+ slug(title);
  }

	render() {
		return (
      <div>
        <Header />
        <main style={{height: 'calc(100% - 70px)'}}>
          <MapMaker onCreate={this.mapCreated.bind(this)}
            mapLayers={this.props.layers}
            basemap={this.props.map.basemap}
            map_id={this.props.map.map_id} title={this.props.map.title}
            owned_by_group_id={this.props.map.owned_by_group_id}
            position={this.props.map.position}
            popularLayers={this.props.popularLayers}
            myLayers={this.props.myLayers}
            myGroups={this.props.myGroups}
             edit/>
        </main>
      </div>
		);
	}
}