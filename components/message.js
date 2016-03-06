var React = require('react');


import {Modal, ModalContent, ModalFooter} from './Modal/Modal';
var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var MessageStore = require('../stores/MessageStore');
var MessageActions = require('../actions/MessageActions');
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');

var Message = React.createClass({

  mixins:[StateMixin.connect(MessageStore), StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  onDismiss(){
    MessageActions.dismissMessage();
  },

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
});

module.exports = Message;
