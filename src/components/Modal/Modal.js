var React = require('react');
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
    className: React.PropTypes.string,
    style:  React.PropTypes.object
  },

  getDefaultProps() {
    return {
      style: {},
      insideAnotherModal: false
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
    className: React.PropTypes.string
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
    id: React.PropTypes.string,
    show: React.PropTypes.bool.isRequired,
    className: React.PropTypes.string, //additional classname to apply to model
    fixedFooter: React.PropTypes.bool,
    dismissible: React.PropTypes.bool,
    in_duration: React.PropTypes.number,
    out_duration: React.PropTypes.number,
    ready: React.PropTypes.func,
    complete: React.PropTypes.func,
    insideAnotherModal: React.PropTypes.bool
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

  componentDidUpdate(prevProps) {
    var _this = this;
    if(this.props.show && !prevProps.show){
      //switch from off to on
      $('#'+this.props.id).openModal({
        dismissible: _this.props.dismissible,
        opacity: _this.props.opacity,
        in_duration: _this.props.in_duration,
        out_duration: _this.props.out_duration,
        ready: _this.props.ready,
        complete: _this.props.complete
      });

      if(this.props.insideAnotherModal){
        //hide duplicate mask overlays
        var overlays = $('.lean-overlay');
        if(overlays.length > 1){
          overlays.each(function( index ) {
            if(index != 0){
              $(this).hide();
            }
          });
        }
        var firstIndex = $('.modal').first().attr('z-index');
        $('.lean-overlay').attr('z-index', firstIndex-1);
      }

      var evt = document.createEvent('UIEvents');
      evt.initUIEvent('resize', true, false, window, 0);
      window.dispatchEvent(evt);
    } else if(prevProps.show && !this.props.show){
      //switch from on to off
      $('#'+this.props.id).closeModal();
      $('.lean-overlay').remove(); //for some reason materialize isn't clearing the overlay mask possibly related to https://github.com/Dogfalo/materialize/issues/1647
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
      <div id={this.props.id} className={className}>
        {this.props.children}
      </div>

    );
  }
});

module.exports = {Modal, ModalContent, ModalFooter};
