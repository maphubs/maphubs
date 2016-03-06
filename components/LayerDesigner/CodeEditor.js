var React = require('react');

import {Modal, ModalContent, ModalFooter} from '../Modal/Modal';

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');


var CodeEditor = React.createClass({

  mixins:[StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    id:  React.PropTypes.string,
    onSave: React.PropTypes.func.isRequired,
    title: React.PropTypes.string.isRequired,
    code: React.PropTypes.string,
    mode: React.PropTypes.object
  },

  getDefaultProps() {
    return {
      id: 'code-editor',
      mode: 'html'
    };
  },

  getInitialState(){
    return {
      code: this.props.code
    };
  },

  componentWillReceiveProps(nextProps){
    this.setState({code: nextProps.code});
  },

  show(){
   this.setState({show: true});
  },

  hide(){
   this.setState({show: false});
  },

  onChange(code){
    this.setState({code});
  },

  onCancel(){
      this.hide();
  },

  onSave(){
    this.hide();
    this.props.onSave(this.state.code);
  },

  render(){
    var editor = '';
    if(this.state.show){
      var Codemirror = require('react-codemirror');
      require('codemirror/mode/javascript/javascript');
      require('codemirror/mode/xml/xml');
        var options = {
          lineNumbers: false,
          readOnly: false,
          mode: this.props.mode
        };
      editor = (
        <Codemirror
          value={this.state.code}
          onChange={this.onChange}
          options={options}
        />
    );
    }
    return (
      <Modal id={this.props.id} show={this.state.show} fixedFooter={true} dismissible={false}>
        <ModalContent style={{padding: '5px'}}>
          <h5>{this.props.title}</h5>
          <div className="left-align" style={{height: 'calc(100% - 56px)'}}>
            {editor}
          </div>

        </ModalContent>
        <ModalFooter>
          <div className="right">
            <a className="waves-effect waves-light btn" style={{float: 'none', marginRight: '15px'}} onClick={this.onCancel}>{this.__('Cancel')}</a>
            <a className="waves-effect waves-light btn" style={{float: 'none'}} onClick={this.onSave}>{this.__('Save')}</a>
          </div>

          </ModalFooter>
      </Modal>
    );
  }
});

module.exports = CodeEditor;
