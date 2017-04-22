//@flow
import React from 'react';
import Header from '../components/header';
import MapMaker from '../components/MapMaker/MapMaker';
var slug = require('slug');
import MapHubsComponent from '../components/MapHubsComponent';
import LocaleActions from '../actions/LocaleActions';
import Rehydrate from 'reflux-rehydrate';
import LocaleStore from '../stores/LocaleStore';

export default class Map extends MapHubsComponent {

  props: {
    popularLayers: PropTypes.array,
    myLayers: PropTypes.array,
    myGroups: PropTypes.array,
    editLayer: PropTypes.object,
    locale: PropTypes.string.isRequired
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
        <Header activePage="map"/>
        <main style={{height: 'calc(100% - 70px)'}}>
          <MapMaker 
            onCreate={this.mapCreated.bind(this)} 
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