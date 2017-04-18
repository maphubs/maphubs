import React from 'react';
import PropTypes from 'prop-types';
var $ = require('jquery');
var classNames = require('classnames');

//Usage: import {Modal, ModalContent, ModalFooter} from 'Modal';
//render(){return(
// <Modal show={true}>
// <ModalContent> My Content </ModalContent>
// <ModalFooter> My Footer </ModalFooter>
// </Modal>
//)}

var ModalContent = React.createClass({
  propTypes:  {
    className: PropTypes.string,
    style:  PropTypes.object,
    children: PropTypes.any
  },

  getDefaultProps() {
    return {
      style: {}
    };
  },

  render(){
    var className = classNames('modal-content', this.props.className);
    return (
      <div className={className} style={this.props.style}>
        {this.props.children}
      </div>
    );
  }
});

var ModalFooter = React.createClass({
  propTypes:  {
    className: PropTypes.string,
    children: PropTypes.any
  },
  render(){
      var className = classNames('modal-footer', this.props.className);
    return (
      <div className={className}>
        {this.props.children}
      </div>
    );
  }
});

var Modal = React.createClass({

  propTypes:  {
    id: PropTypes.string,
    show: PropTypes.bool.isRequired,
    className: PropTypes.string, //additional classname to apply to model
    fixedFooter: PropTypes.bool,
    dismissible: PropTypes.bool,
    in_duration: PropTypes.number,
    out_duration: PropTypes.number,
    opacity: PropTypes.number,
    ready: PropTypes.func,
    complete: PropTypes.func,
    children: PropTypes.any
  },

  getDefaultProps() {
    return {
      id:'modal',
      show: false,
      fixedFooter: false,
      className: '',
      //settings from materializeCSS
      dismissible: true, // Modal can be dismissed by clicking outside of the modal
      opacity: .5, // Opacity of modal background
      in_duration: 300, // Transition in duration
      out_duration: 200, // Transition out duration
      ready() {}, // Callback for Modal open
      complete() {} // Callback for Modal close
    };
  },

  componentDidMount(){
     $(this.refs.modal).modal({
        dismissible: this.props.dismissible,
        opacity: this.props.opacity,
        in_duration: this.props.in_duration,
        out_duration: this.props.out_duration,
        ready: this.props.ready,
        complete: this.props.complete
      });
  },

  componentDidUpdate(prevProps) {
    if(this.props.show && !prevProps.show){
      //switch from off to on
      $(this.refs.modal).modal('open');
      //fire window resize for maps etc inside the modal
      var evt = document.createEvent('UIEvents');
      evt.initUIEvent('resize', true, false, window, 0);
      window.dispatchEvent(evt);
    } else if(prevProps.show && !this.props.show){
      //switch from on to off
      $(this.refs.modal).modal('close');
      //$('.lean-overlay').remove(); //for some reason materialize isn't clearing the overlay mask possibly related to https://github.com/Dogfalo/materialize/issues/1647
    }

  },

  render() {
    var className = '';
    if(this.props.fixedFooter) {
      className = classNames('modal', 'modal-fixed-footer', this.props.className);
    }else{
      className = classNames('modal', this.props.className);
    }
    return (
      <div ref="modal" id={this.props.id} className={className}>
        {this.props.children}
      </div>

    );
  }
});

module.exports = {Modal, ModalContent, ModalFooter};
