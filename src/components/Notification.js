//@flow
import React from 'react';
import Reflux from 'reflux';
import {Notification} from 'react-notification';
import NotificationStore from '../stores/NotificationStore';
import NotificationActions from '../actions/NotificationActions';
import _isequal from 'lodash.isequal';

type Props = {

}

import type {NotificationStoreState} from '../stores/NotificationStore';
type State = NotificationStoreState

export default class MapHubsNotification extends Reflux.Component<void, Props, State> {

  constructor(props: Props){
		super(props);
		this.stores = [NotificationStore];
	}

  shouldComponentUpdate(nextProps: Props, nextState: State){
    //only update if something changes

    if(!_isequal(this.props, nextProps)){
      return true;
    }
    if(!_isequal(this.state, nextState)){
      return true;
    }
    return false;
  }

  onDismiss = () => {
    NotificationActions.dismissNotification();
  }

  render() {
    var position = {};
    switch(this.state.position) {
      case 'topright':
        position = {top: '60px', right: '20px', bottom: undefined, left: undefined};
        break;
      case 'bottomright':
        position = {top: undefined, right: '20px', bottom: '60px', left: undefined};
        break;
      case 'topleft':
        position = {top: '60px', right: undefined, bottom: undefined, left: '20px'};
        break;
      case 'bottomleft':
        position = {top: undefined, right: undefined, bottom: '60px', left: '20px'};
        break;

      default: break;
    }

    return (
      <Notification
      id="omh-notification"
      isActive={this.state.isActive}
      message={this.state.message}
      action={this.state.action}
      onClick={this.state.onClick}
      dismissAfter={this.state.dismissAfter}
      onDismiss={this.onDismiss}
      barStyle={{background:this.state.backgroundColor}}
      activeBarStyle={position}
      actionStyle={{color: this.state.color}}
      />
    );

  }
}
