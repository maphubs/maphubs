var React = require('react');
var Formsy = require('formsy-react');
var Radio = require('./forms/radio');

import {Modal, ModalContent, ModalFooter} from './Modal/Modal';


var RadioModal = React.createClass({

  propTypes: {
    onCancel: React.PropTypes.func,
    onSubmit: React.PropTypes.func.isRequired,
    options: React.PropTypes.array.isRequired,
    title: React.PropTypes.string.isRequired
  },

  getInitialState(){
    return {
      show: false,
      canSubmit: false,
      selectedOption: null
    };
  },

  show(){
    this.setState({show: true});
  },

  hide(){
   this.setState({show: false});
  },

  onCancel(){
    if(this.props.onCancel) this.props.onCancel();
    this.hide();
  },

  onSubmit(){
    this.props.onSubmit(this.state.selectedOption);
    this.hide();
  },

  enableButton () {
    this.setState({
      canSubmit: true
    });
  },
  disableButton () {
    this.setState({
      canSubmit: false
    });
  },

  optionChange(value){
    this.setState({selectedOption: value});
  },

  render(){
    return (
      <Modal id="radio-modal" show={this.state.show} fixedFooter={true} dismissible={false}>
        <ModalContent>
          <h5>{this.props.title}</h5>
            <Formsy.Form onValid={this.enableButton} onInvalid={this.disableButton}>
              <Radio name="type" label="" options={this.props.options} onChange={this.optionChange}
                />
            </Formsy.Form>
        </ModalContent>
        <ModalFooter>
          <div className="right">
            <button className="waves-effect waves-light btn" style={{float: 'none', marginRight: '15px'}} onClick={this.onCancel}>Cancel</button>
            <button className="waves-effect waves-light btn" style={{float: 'none'}} disabled={!this.state.canSubmit} onClick={this.onSubmit}>Submit</button>
          </div>

          </ModalFooter>
      </Modal>
    );
  }
});

module.exports = RadioModal;
