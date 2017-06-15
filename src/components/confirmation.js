//@flow
import React from 'react';
import {Modal, ModalContent, ModalFooter} from './Modal/Modal';
import Reflux from 'reflux';
import Store from '../stores/ConfirmationStore';
import Actions from '../actions/ConfirmationActions';

type Props = {}

export default class Confirmation extends Reflux.Component<void, Props, void> {

  constructor(props: Props){
		super(props);
		this.stores = [Store];
	}

  hide = () => {
    Actions.reset();
  }

  onNegativeResponse = () => {
    this.state.onNegativeResponse();
    this.hide();
  }

  onPositiveResponse = () => {
    this.state.onPositiveResponse();
    this.hide();
  }

  render(){
    return (
      <Modal id="confirmation" show={this.state.show} fixedFooter={false} dismissible={false}>
        <ModalContent>
          <h5>{this.state.title}</h5>
          <p>{this.state.message}</p>
        </ModalContent>
        <ModalFooter>
          <div className="right">
            <a className="waves-effect waves-light btn" style={{float: 'none', marginRight: '15px'}} onClick={this.onNegativeResponse}>{this.state.negativeButtonText}</a>
            <a className="waves-effect waves-light btn" style={{float: 'none'}} onClick={this.onPositiveResponse}>{this.state.postitiveButtonText}</a>
          </div>

          </ModalFooter>
      </Modal>
    );
  }
}
