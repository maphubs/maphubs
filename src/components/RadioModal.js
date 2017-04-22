//@flow
import React from 'react';
import Formsy from 'formsy-react';
import Radio from'./forms/radio';

import {Modal, ModalContent, ModalFooter} from './Modal/Modal';

export default class RadioModal extends React.Component {

  props: {
    onCancel: Function,
    onSubmit: Function,
    options: Array<Object>,
    title: string
  }

  state: {
      show: false,
      canSubmit: false,
      selectedOption: null
  }

  show(){
    this.setState({show: true});
  }

  hide(){
   this.setState({show: false});
  }

  onCancel(){
    if(this.props.onCancel) this.props.onCancel();
    this.hide();
  }

  onSubmit(){
    this.props.onSubmit(this.state.selectedOption);
    this.hide();
  }

  enableButton () {
    this.setState({
      canSubmit: true
    });
  }

  disableButton () {
    this.setState({
      canSubmit: false
    });
  }

  optionChange(value: string){
    this.setState({selectedOption: value});
  }

  render(){
    return (
      <Modal id="radio-modal" show={this.state.show} fixedFooter={true} dismissible={false}>
        <ModalContent>
          <h5>{this.props.title}</h5>
            <Formsy.Form onValid={this.enableButton.bind(this)} onInvalid={this.disableButton.bind(this)}>
              <Radio name="type" label="" options={this.props.options} onChange={this.optionChange}
                />
            </Formsy.Form>
        </ModalContent>
        <ModalFooter>
          <div className="right">
            <button className="waves-effect waves-light btn" style={{float: 'none', marginRight: '15px'}} onClick={this.onCancel.bind(this)}>Cancel</button>
            <button className="waves-effect waves-light btn" style={{float: 'none'}} disabled={!this.state.canSubmit} onClick={this.onSubmit.bind(this)}>Submit</button>
          </div>

          </ModalFooter>
      </Modal>
    );
  }
}