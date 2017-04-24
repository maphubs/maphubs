//@flow
import React from 'react';
import Radio from '../forms/radio';
import Formsy from 'formsy-react';
import BaseMapStore from '../../stores/map/BaseMapStore';
import MapHubsComponent from '../MapHubsComponent';

export default class BaseMapSelection extends MapHubsComponent {

  props: {
    onChange: Function
  }

  constructor(props: Object){
    super(props);
    this.stores.push(BaseMapStore);
  }

  onChange = (val: string) => {
    this.props.onChange(val);
  }

  render(){
    var baseMapOptions = [
      {value: 'default', label: this.__('Default (Light)')},
      {value: 'dark', label: this.__('Dark')},
      {value: 'streets', label: this.__('Streets')}
    ];
    if(MAPHUBS_CONFIG.useMapboxBaseMaps){
      baseMapOptions.push({value: 'outdoors', label: this.__('Outdoors')});
      baseMapOptions.push({value: 'mapbox-satellite', label: this.__('Mapbox Satellite')});
    }

    baseMapOptions.push({value: 'bing-satellite', label: this.__('Bing Aerial')});
    baseMapOptions.push({value: 'landsat-2016', label: this.__('Landsat - 2016')});
    baseMapOptions.push({value: 'landsat-2014', label: this.__('Landsat - 2014')});
    baseMapOptions.push({value: 'stamen-toner', label: this.__('Stamen - Toner')});
    baseMapOptions.push({value: 'stamen-terrain', label: this.__('Stamen - Terrain')});
    baseMapOptions.push({value: 'stamen-watercolor', label: this.__('Stamen - Watercolor')});

    return (
      <div style={{width: '100%', marginRight: '10px', backgroundColor: 'white', textAlign: 'left'}}>
          <Formsy.Form>
          <h6>{this.__('Choose a Base Map')}</h6>
          <Radio name="baseMap" label="" className="base-map-selection"
              defaultValue={this.state.baseMap}
              options={baseMapOptions} onChange={this.onChange}
            />
          </Formsy.Form>
        </div>
    ); 
  }
}