import React from 'react';
import {Modal, ModalContent} from './Modal/Modal';

export default class Progress extends React.Component {

  props: {
    id: string,
    message: string,
    onClose: Function,
    show: boolean,
    title: string,
    subTitle: string
  }

  static defaultProps = {
    id: 'progress',
    show: false,
    message: '',
    onClose: null
  }


  constructor(props){
    super(props);
    this.state = {
      show: props.show
    };
  }

  componentWillReceiveProps(nextProps) {
    if(this.props.show !== nextProps.show){
      this.setState({
        show: nextProps.show
      });
    }
  }

  onClose = () => {
    this.setState({show: false});
    if(this.props.onClose) this.props.onClose();
  }

  render(){

    let subTitle = '';
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
}