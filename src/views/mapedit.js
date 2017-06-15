//@flow
import React from 'react';
import Header from '../components/header';
import MapMaker from '../components/MapMaker/MapMaker';
var slug = require('slug');
import MapHubsComponent from '../components/MapHubsComponent';
import Reflux from '../components/Rehydrate';
import LocaleStore from '../stores/LocaleStore';

type Props = {
  map: Object,
  layers: Array<Object>,
  popularLayers:Array<Object>,
  myLayers: Array<Object>,
  myGroups: Array<Object>,
  locale: string,
  _csrf: string,
  headerConfig: Object,
  mapConfig: Object
}

type DefaultProps = {
  popularLayers:Array<Object>,
  myLayers: Array<Object>
}

export default class MapEdit extends MapHubsComponent<DefaultProps, Props, void> {

  props: Props

  static defaultProps = {
    popularLayers: [],
    myLayers: []
  }

  constructor(props: Object) {
    super(props);
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf});
  }

  mapCreated = (map_id: string, title: string) => {
    window.location = '/map/view/' + map_id + '/'+ slug(title);
  }

	render() {
		return (
      <div>
        <Header {...this.props.headerConfig}/>
        <main style={{height: 'calc(100% - 70px)'}}>
          <MapMaker onCreate={this.mapCreated}
            mapConfig={this.props.mapConfig}
            mapLayers={this.props.layers}
            basemap={this.props.map.basemap}
            map_id={this.props.map.map_id} title={this.props.map.title}
            owned_by_group_id={this.props.map.owned_by_group_id}
            position={this.props.map.position}
            settings={this.props.map.settings}
            popularLayers={this.props.popularLayers}
            myLayers={this.props.myLayers}
            myGroups={this.props.myGroups}
             edit/>
        </main>
      </div>
		);
	}
}