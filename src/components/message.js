//@flow
import React from 'react';
import {Modal, ModalContent, ModalFooter} from './Modal/Modal';
import MessageActions from '../actions/MessageActions';
import MessageStore from '../stores/MessageStore';
import MapHubsComponent from './MapHubsComponent';

type Props = {}

import {MessageStoreState} from '../stores/MessageStore';

export default class Message extends MapHubsComponent<void, Props, MessageStoreState> {

  constructor(props: Props){
		super(props);
		this.stores.push(MessageStore);
	}

  onDismiss = () => {
    MessageActions.dismissMessage();
  }

  render(){
    /*eslint-disable react/no-danger*/
    return (
      <Modal id="message-modal" show={this.state.show} fixedFooter={false}>
        <ModalContent>
          <h4>{this.state.title}</h4>
          <div dangerouslySetInnerHTML={{__html: this.state.message.toString()}}></div>
        </ModalContent>
        <ModalFooter>
          <a href="#!" className=" modal-action modal-close waves-effect waves-light btn-flat" onClick={this.onDismiss}>{this.__('Okay')}</a>
        </ModalFooter>
      </Modal>
    );
    /*eslint-enable react/no-danger*/
  }
}