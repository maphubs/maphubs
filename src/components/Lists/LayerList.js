//@flow
import React from 'react';
import MapHubsComponent from '../MapHubsComponent';
import slug from 'slug';
import type {Layer} from '../../stores/layer-store';
import _isequal from 'lodash.isequal';

type Props = {|
  layers: Array<Layer>
|}

export default class LayerList extends MapHubsComponent<void, Props, void> {

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
          <h4>{this.__('Layers')}</h4>
        </li>
        {this.props.layers.map((layer, i) => {
          let layer_id = layer && layer.layer_id ? layer.layer_id : 0;
          let slugName = slug(this._o_(layer.name));
          return (
            <li className="collection-item" key={layer_id}>
              <div>{this._o_(layer.name)}
                <a className="secondary-content" href={`/layer/map/${layer_id}/${slugName}`}>
                  <i className="material-icons">map</i>
                </a>
                <a className="secondary-content" href={`/layer/info/${layer_id}/${slugName}`}>
                  <i className="material-icons">info</i>
                </a>
              </div>
            </li>
          );
        })}
      </ul>
    );
  }
}