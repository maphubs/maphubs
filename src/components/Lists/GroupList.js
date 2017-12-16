//@flow
import React from 'react';
import MapHubsComponent from '../MapHubsComponent';
import _isequal from 'lodash.isequal';

type Props = {|
  groups: Array<Object>,
  showTitle: boolean
|}

type DefaultProps = {
  showTitle: boolean
}

export default class GroupList extends MapHubsComponent<Props, void> {

  static defaultProps: DefaultProps = {
    showTitle: true
  }
  
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
          <h4>{this.__('Groups')}</h4>
        </li>
      );
    }

    return (
      <ul className={className}>
        {title}
        {this.props.groups.map((group, i) => {
          const groupName = this._o_(group.name);
          return (
            <li className="collection-item" key={group.group_id}>
              <div>{groupName}                
                <a className="secondary-content" href={'/group/' + group.group_id}>
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