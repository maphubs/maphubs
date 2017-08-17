//@flow
import React from 'react';
import {HOC} from 'formsy-react';
var classNames = require('classnames');
var $ = require('jquery');
import MapHubsPureComponent from '../MapHubsPureComponent';
import _isequal from 'lodash.isequal';

type Props = {|
  value: string,
  length: number,
  successText: string,
  disabled: boolean,
  icon: string,
  className: string,
  dataTooltip: string,
  dataDelay: number,
  dataPosition: string,
  name: string,
  label: string,
  placeholder: string,
  id: string,
  type: string,
  style: Object,
  showCharCount: boolean,
  useMaterialize: boolean,
  onClick: Function,
  //Added by Formsy
  showRequired: Function,
  isValid: Function,
  showError: Function,
  setValue: Function,
  getErrorMessage: Function
|}

type State = {
  value: string,
  charCount: number
}

class TextInput extends MapHubsPureComponent<Props, State> {

  props: Props

  static defaultProps = {
      length: 100,
      successText: '',
      defaultValue: '',
      disabled: false,
      value: '',
      dataDelay: 100,
      type: 'text',
      style: {},
      showCharCount: true,
      useMaterialize: true
  }

  constructor(props: Props) {
    super(props);
    this.state = {
      value: props.value,
      charCount: props.value ? props.value.length: 0
    };
  }

  componentWillReceiveProps(nextProps: Props) {
    if(this.props.value !== nextProps.value){
      var charCount = 0;
      if(nextProps.value) charCount = nextProps.value.length;
      this.setState({
        value: nextProps.value,
        charCount
      });
    }
  }

  componentDidMount(){
    if(this.props.dataTooltip){
      $(this.refs.inputWrapper).tooltip();
    }
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

  componentDidUpdate(prevProps: Props){
    if(!prevProps.dataTooltip && this.props.dataTooltip){
      $(this.refs.inputWrapper).tooltip();
    }
  }

  changeValue = (event) => {
     event.stopPropagation();
     this.props.setValue(event.currentTarget.value);
     this.setState({
       value: event.currentTarget.value,
       charCount: event.currentTarget.value.length
     });
   }

  render() {
    var className, inputClassName = '';
    if(this.props.useMaterialize){
      className = classNames('input-field', this.props.className);
      inputClassName = classNames(
        {
        required: this.props.showRequired(),
        valid: this.props.isValid(),
        invalid:  this.props.showError()
       }
    );
    }else{
      className = classNames(this.props.className);
    }



   var icon = '';
   if(this.props.icon){
      icon = (<i className="material-icons prefix">{this.props.icon}</i>);
   }
   var countColor = 'black';
   if(this.state.charCount > this.props.length) countColor = 'red';

   var labelClassName = '';
   if(this.state.value && this.state.value !== ''){
     labelClassName = 'active';
   }

   var id = '';
   if(this.props.id){
     id = this.props.id;
   }else {
     id = this.props.name;
   }
   var charCount = '';
   if(this.props.showCharCount){
     charCount = (
       <span className="character-counter"
           style={{float: 'right', fontSize: '12px', height: '1px', color: countColor}}>
         {this.state.charCount} / {this.props.length}
       </span>
     );
   }

    return (
      <div ref="inputWrapper" className={className} style={this.props.style} data-delay={this.props.dataDelay} data-position={this.props.dataPosition} data-tooltip={this.props.dataTooltip}>
          {icon}
          <input ref="input" id={id} type={this.props.type} className={inputClassName} placeholder={this.props.placeholder} value={this.state.value}
            disabled={this.props.disabled}
            onClick={this.props.onClick}
            onChange={this.changeValue}/>
          <label htmlFor={id} className={labelClassName} data-error={this.props.getErrorMessage()} data-success={this.props.successText}>{this.props.label}</label>
            {charCount}
      </div>
    );

  }
}
export default HOC(TextInput);