//@flow
import React from 'react';
import MapHubsComponent from '../MapHubsComponent';
import slugify from 'slugify';
import _isequal from 'lodash.isequal';

type Props = {|
  maps: Array<Object>,
  showTitle: boolean
|}

type DefaultProps = {
  showTitle: true;
}

export default class MapList extends MapHubsComponent<DefaultProps, Props, void> {

   shouldComponentUpdate(nextProps: Props){
    //only update if something changes
    if(!_isequal(this.props, nextProps)){
      return true;
    }
    return false;
  }

  render(){
    let title = '', className = "collection";
    if(this.props.showTitle){
      className = "collection with-header";
      title = (
        <li className="collection-header">
          <h4>{this.__('Maps')}</h4>
        </li>
      );
    }

    return (
      <ul className={className}>
        {title}
        {this.props.maps.map((map, i) => {
          let mapTitle = this._o_(map.title);
          let slugTitle = slugify(mapTitle);
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