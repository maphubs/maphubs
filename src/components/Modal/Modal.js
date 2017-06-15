//@flow
import React from 'react';
import Reflux from 'reflux';
var $ = require('jquery');
var classNames = require('classnames');
import fireResizeEvent from '../../services/fire-resize-event';

//Usage: import {Modal, ModalContent, ModalFooter} from 'Modal';
//render(){return(
// <Modal show={true}>
// <ModalContent> My Content </ModalContent>
// <ModalFooter> My Footer </ModalFooter>
// </Modal>
//)}

type ModalContentProps = {|
  className?: string,
  style:  Object,
  children: any
|}

type ModalContentDefaultProps = {
  style:  Object
}

export class ModalContent extends Reflux.Component<ModalContentDefaultProps, ModalContentProps, void>  {
  props: ModalContentProps

  static defaultProps = {
    style: {}
  }
  render(){
    var className = classNames('modal-content', this.props.className);
    return (
      <div className={className} style={this.props.style}>
        {this.props.children}
      </div>
    );
  }
}

type ModalFooterProps = {|
  className?: string,
  children: any
|}

export class ModalFooter extends Reflux.Component<void, ModalFooterProps, void> {
  props: ModalFooterProps
  render(){
      var className = classNames('modal-footer', this.props.className);
    return (
      <div className={className}>
        {this.props.children}
      </div>
    );
  }
}

type ModalProps = {|
  id: string,
  show: boolean,
  className: string, //additional classname to apply to model
  fixedFooter: boolean,
  dismissible: boolean,
  in_duration: number,
  out_duration: number,
  opacity: number,
  ready?: Function,
  complete?: Function,
  children: any
|}

type ModalDefaultProps = {
   id: string,
   show: boolean,
   className: string,
   fixedFooter: boolean,
   dismissible: boolean,
   opacity: number,
   in_duration: number,
   out_duration: number
}


export class Modal extends Reflux.Component<ModalDefaultProps, ModalProps, void> {

  props: ModalProps;

  static defaultProps: ModalDefaultProps = {
    id:'modal',
    show: false,
    fixedFooter: false,
    className: '',
    //settings from materializeCSS
    dismissible: true, // Modal can be dismissed by clicking outside of the modal
    opacity: .5, // Opacity of modal background
    in_duration: 300, // Transition in duration
    out_duration: 200 // Transition out duration
  }

  constructor(props: ModalProps){
    super(props);
  }

  componentDidMount(){
     $(this.refs.modal).modal({
        dismissible: this.props.dismissible,
        opacity: this.props.opacity,
        in_duration: this.props.in_duration,
        out_duration: this.props.out_duration,
        ready: this.props.ready,
        complete: this.props.complete
      });
  }

  componentDidUpdate(prevProps: ModalProps) {
    if(this.props.show && !prevProps.show){
      //switch from off to on
      $(this.refs.modal).modal('open');
      //fire window resize for maps etc inside the modal
      fireResizeEvent();
    } else if(prevProps.show && !this.props.show){
      //switch from on to off
      $(this.refs.modal).modal('close');
      //$('.lean-overlay').remove(); //for some reason materialize isn't clearing the overlay mask possibly related to https://github.com/Dogfalo/materialize/issues/1647
    }

  }

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
}

