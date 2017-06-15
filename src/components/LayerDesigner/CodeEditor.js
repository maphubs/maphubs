//@flow
import React from 'react';
import {Modal, ModalContent, ModalFooter} from '../Modal/Modal';
import _isequal from 'lodash.isequal';

var AceEditor;
if(process.env.APP_ENV === 'browser'){
  require('brace');
   AceEditor = require('react-ace').default;
   require('brace/mode/json');
   require('brace/mode/html');
   require('brace/theme/monokai');
}
import MapHubsComponent from '../MapHubsComponent';

type Props = {|
  id:  string,
  onSave: Function,
  title: string,
  code: string,
  mode: string,
  theme: string,
  modal: boolean
|}

type DefaultProps = {
  id:  string,
  mode: string,
  theme: string,
  modal: boolean
}

type State = {
  code: string,
  canSave: boolean,
  show: boolean
}

export default class CodeEditor extends MapHubsComponent<DefaultProps, Props, State> {

  props: Props

  static defaultProps = {
      id: 'code-editor',
      mode: 'json',
      theme: 'monokai',
      modal: true
  }

  editor: any

  constructor(props: Props){
    super(props);
    this.state = {
      code: props.code,
      canSave: true,
      show: false
    };
  }

  componentWillReceiveProps(nextProps: Props){
    this.setState({code: nextProps.code});
  }

  shouldComponentUpdate(nextProps: Props, nextState: State){
    //only update if something changes
    if(!_isequal(this.props, nextProps)){
      return true;
    }
    if(!_isequal(this.state, nextState)){
      return true;
    }
    return false;
  }

  componentDidUpdate(){
    var _this = this;
    if(this.refs.ace){
      this.editor = this.refs.ace.editor;
      this.editor.getSession().on("changeAnnotation", () => {
        var annotations = _this.editor.getSession().getAnnotations();
        var canSave = true;
        if(annotations && annotations.length > 0){
          annotations.forEach((anno) => {
            if(anno.type === 'error'){
              canSave = false;
            }
          });
        }
        _this.setState({canSave});
      });
    }
  }

  show = () => {
   this.setState({show: true});
  }

  hide = () => {
   this.setState({show: false});
  }

  onChange = (code: any) => {
    this.setState({code});
  }

  onCancel = () => {
      this.hide();
  }

  onSave = () => {
    if(this.state.canSave){
      if(this.props.modal){
        this.hide();
      }    
      this.props.onSave(this.state.code);
    }
  }

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
}