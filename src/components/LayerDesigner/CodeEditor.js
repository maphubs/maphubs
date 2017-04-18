import React from 'react';
import PropTypes from 'prop-types';

import {Modal, ModalContent, ModalFooter} from '../Modal/Modal';

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');
var _isequal = require('lodash.isequal');

var AceEditor;
if(process.env.APP_ENV === 'browser'){
  require('brace');
   AceEditor = require('react-ace').default;
   require('brace/mode/json');
   require('brace/mode/html');
   require('brace/theme/monokai');
}

var CodeEditor = React.createClass({

  mixins:[StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    id:  PropTypes.string,
    onSave: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    code: PropTypes.string,
    mode: PropTypes.string,
    theme: PropTypes.string,
    modal: PropTypes.bool
  },

  getDefaultProps() {
    return {
      id: 'code-editor',
      mode: 'json',
      theme: 'monokai',
      modal: true
    };
  },

  getInitialState(){
    return {
      code: this.props.code,
      canSave: true,
      show: false
    };
  },

  componentWillReceiveProps(nextProps){
    this.setState({code: nextProps.code});
  },

  shouldComponentUpdate(nextProps, nextState){
    //only update if something changes
    if(!_isequal(this.props, nextProps)){
      return true;
    }
    if(!_isequal(this.state, nextState)){
      return true;
    }
    return false;
  },

  componentDidUpdate(){
    var _this = this;
    if(this.refs.ace){
      this.editor = this.refs.ace.editor;
      this.editor.getSession().on("changeAnnotation", function(){
        var annotations = _this.editor.getSession().getAnnotations();
        var canSave = true;
        if(annotations && annotations.length > 0){
          annotations.forEach(function(anno){
            if(anno.type === 'error'){
              canSave = false;
            }
          });
        }
        _this.setState({canSave});
      });
    }
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
    if(this.state.canSave){
      if(this.props.modal){
        this.hide();
      }    
      this.props.onSave(this.state.code);
    }

  },

  render(){
    var editor = '';
    if(this.state.show){

      editor = (
        <AceEditor
          ref="ace"
          mode={this.props.mode}
          theme={this.props.theme}
          onChange={this.onChange}
          name={this.props.id}
          width="100%"
          height="100%"
          highlightActiveLine={true}
          enableBasicAutocompletion={true}
          value={this.state.code}
          editorProps={{$blockScrolling: true}}
        />
    );
  }
  if(this.props.modal){
    return (
      <Modal id={this.props.id} show={this.state.show} className="code-edit-modal" fixedFooter={true} dismissible={false}>
        <ModalContent style={{padding: '0px'}}>

          <div className="left-align" style={{height: '100%'}}>
            {editor}
          </div>

        </ModalContent>
        <ModalFooter>

          <p className="left no-padding">{this.props.title}</p>
          <div className="right">
            <a className="waves-effect waves-light btn" style={{float: 'none', marginRight: '15px'}} onClick={this.onCancel}>{this.__('Cancel')}</a>
            <a className="waves-effect waves-light btn" style={{float: 'none'}} disabled={!this.state.canSave} onClick={this.onSave}>{this.__('Save')}</a>
          </div>

          </ModalFooter>
      </Modal>
    );
  }else{
    return (
      <div style={{height: 'calc(100% - 100px)', width: '100%'}}>
        <p className="left no-padding">{this.props.title}</p>
        {editor}
         <div className="right">
            <a className="waves-effect waves-light btn" style={{float: 'none', marginTop: '15px'}} disabled={!this.state.canSave} onClick={this.onSave}>{this.__('Save')}</a>
          </div>
      </div>
    );
  }
  }
});

module.exports = CodeEditor;
