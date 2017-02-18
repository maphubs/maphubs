var React = require('react');

import {Modal, ModalContent} from './Modal/Modal';


var Progress = React.createClass({

  displayName: 'Progress',

  propTypes: {
    id: React.PropTypes.string,
    message: React.PropTypes.string,
    onClose: React.PropTypes.func,
    show: React.PropTypes.bool,
    title: React.PropTypes.string,
    subTitle: React.PropTypes.string
  },

  getDefaultProps() {
    return {
      id: 'progress',
      show: false,
      message: '',
      onClose: null
    };
  },


  getInitialState() {
  return {
    show: this.props.show
  };
},

  componentWillReceiveProps(nextProps) {
    if(this.props.show != nextProps.show){
      this.setState({
        show: nextProps.show
      });
    }
  },

  onClose(){
    this.setState({show: false});
    if(this.props.onClose) this.props.onClose();
  },

  render(){

    var subTitle = '';
    if(this.props.subTitle){
      subTitle = (
        <div className="row">
          <p className="center">{this.props.subTitle}</p>
        </div>
      );
    }
    return (
      <Modal id={this.props.id} show={this.state.show} dismissible={false} fixedFooter={false}>
        <ModalContent className="valign-wrapper">
          <div className="container">
            <div className="row">
              <h4 className="center">{this.props.title}</h4>
            </div>
            {subTitle}
            <div className="row">
              <div className="progress">
                 <div className="indeterminate"></div>
             </div>
            </div>
          </div>
        </ModalContent>

      </Modal>
    );

  }
});



module.exports = Progress;
