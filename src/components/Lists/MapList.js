//@flow
import React from 'react';
import MapHubsComponent from '../MapHubsComponent';
import slug from 'slug';
import type {Layer} from '../../stores/layer-store';
import _isequal from 'lodash.isequal';

type Props = {|
  maps: Array<Object>
|}

export default class MapList extends MapHubsComponent<void, Props, void> {

   shouldComponentUpdate(nextProps: Props){
    //only update if something changes
    if(!_isequal(this.props, nextProps)){
      return true;
    }
    return false;
  }

  render(){
    return (
      <ul className="collection with-header">
        <li className="collection-header">
          <h4>{this.__('Maps')}</h4>
        </li>
        {this.props.maps.map((map, i) => {
          let mapTitle = this._o_(map.title);
          let slugTitle = slug(mapTitle);
          return (
            <li className="collection-item" key={map.map_id}>
              <div>{mapTitle}
                <a className="secondary-content" href={`/map/view/${map.map_id}/${slugTitle}`}>
                  <i className="material-icons">map</i>
                </a>                     
              </div>
            </li>
          );
        })}
      </ul>
    );
  }
}