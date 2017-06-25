//@flow
import React from 'react';
import MapHubsComponent from '../MapHubsComponent';
import _isequal from 'lodash.isequal';

type Props = {|
  hubs: Array<Object>
|}

export default class HubList extends MapHubsComponent<void, Props, void> {

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
          <h4>{this.__('Hubs')}</h4>
        </li>
        {this.props.hubs.map((hub, i) => {
          return (
            <li className="collection-item" key={hub.hub_id}>
              <div>{hub.name}                
                <a className="secondary-content" href={'/hub/' + hub.hub_id}>
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