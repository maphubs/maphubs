//@flow
import React from 'react';
import Header from '../components/header';
import InteractiveMap from '../components/InteractiveMap';
import MapHubsComponent from '../components/MapHubsComponent';
import Reflux from '../components/Rehydrate';
import LocaleStore from '../stores/LocaleStore';
import BaseMapStore from '../stores/map/BaseMapStore';
import ErrorBoundary from '../components/ErrorBoundary';

type Props = {
  layer: Object,
  locale: string,
  _csrf: string,
  headerConfig: Object,
  mapConfig: Object
}

export default class LayerMap extends MapHubsComponent<Props, void> {

  props: Props

  constructor(props: Props) {
    super(props);
    this.stores.push(BaseMapStore);
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf});
    if(props.mapConfig && props.mapConfig.baseMapOptions){
       Reflux.rehydrate(BaseMapStore, {baseMapOptions: props.mapConfig.baseMapOptions});
    }
  }

	render() {
		return (
      <ErrorBoundary>
        <Header {...this.props.headerConfig}/>
        <main className="no-margin" style={{margin: 0, height: 'calc(100% - 50px)', width: '100%'}}>         
          <InteractiveMap 
            ref="interactiveMap" 
            height="100%"       
            fitBounds={this.props.layer.preview_position.bbox}
            style={this.props.layer.style} 
            layers={[this.props.layer]}
            map_id={this.props.layer.layer_id}
            mapConfig={this.props.mapConfig}
            disableScrollZoom={false}
            title={this.props.layer.name}
            hideInactive={false}
            showTitle={false}
          >
          </InteractiveMap> 
        </main>
      </ErrorBoundary>
		);
	}
}