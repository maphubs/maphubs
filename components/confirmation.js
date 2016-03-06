var React = require('react');


import {Modal, ModalContent, ModalFooter} from './Modal/Modal';
var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var Store = require('../stores/ConfirmationStore');


var Confirmation = React.createClass({

  mixins:[StateMixin.connect(Store)],

  hide(){
   this.setState({show: false});
  },

  onNegativeResponse(){
    this.state.onNegativeResponse();
    this.hide();
  },

  onPositiveResponse(){
    this.state.onPositiveResponse();
    this.hide();
  },

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
});

module.exports = Confirmation;
