//@flow
import React from 'react';

import {HOC} from 'formsy-react';
import find from 'lodash.find';
import result from 'lodash.result';
var classNames = require('classnames');

import ReactMaterialSelect from 'react-material-select';
import MapHubsComponent from '../MapHubsComponent';

type Props = {|
  emptyText: string,
  value: string,
  name: string,
  className: string,
  options: Array<Object>,
  dataTooltip: string,
  dataDelay: number,
  dataPosition: string,
  label: string,
  successText: string,
  id: string,
  onChange: Function,
  startEmpty: boolean,
  icon: string,
  note: string, //optional note that displays below the select, will be updated on selection if option contains a note
  setValue: Function,
  getValue: Function,
  isRequired: Function,
  getErrorMessage: Function
|}

type DefaultProps = {
  startEmpty: boolean,
  emptyText: string,
  name: string,
  id: string,
  options: Array<Object>,
  dataDelay: number
}

type State = {
  note: string
}

class Select extends MapHubsComponent<DefaultProps, Props, State> {

  props:  Props

  static defaultProps: DefaultProps = {
    startEmpty: true,
    emptyText: 'Choose an Option',
    name: 'select-box',
    id: 'select-box',
    options: [],
    dataDelay: 100
  }

  constructor(props: Props){
    super(props);
    this.state = {
      note: props.note
    };
  }

  componentWillMount() {
    super.componentWillMount();
    this.props.setValue(this.props.value);
    this.setNote(this.props.value);
  }

  componentWillReceiveProps(nextProps){
    if(!nextProps.startEmpty && this.props.value !== nextProps.value) {
      this.props.setValue(nextProps.value);
      this.setNote(nextProps.value);
    }
  }

  setNote = (val) => {
    var note = result(find(this.props.options, {'value': val}), 'note');
    if(note){
      this.setState({note});
    }
  }

  handleSelectChange = (selected) => {
     var val = selected.value;
     this.props.setValue(val);
     this.setNote(val);
     if(this.props.onChange){
       this.props.onChange(val);
     }
   }

   validate = () => {
     if(this.props.isRequired()){
       if(this.props.getValue() && this.props.getValue() !== ''){
         return true;
       }else{
         return false;
       }
     }else{
       return true;
     }
  }

  render() {
    var className = classNames('input-field', {tooltipped: this.props.dataTooltip ? true : false});
    var value = this.props.getValue();

    var note = '';
    if(this.state.note){
      /*eslint-disable react/no-danger*/
      note = (<div dangerouslySetInnerHTML={{__html: this.state.note}}></div>);
      /*eslint-enable react/no-danger*/
    }

    var icon = '';
    if(this.props.icon){
        icon = (<i className="material-icons prefix">{this.props.icon}</i>);
    }

    return (
      <div className={this.props.className}>
          
          <div  className={className} id={this.props.id} data-delay={this.props.dataDelay} data-position={this.props.dataPosition}
              data-tooltip={this.props.dataTooltip}>
              {icon}
              <ReactMaterialSelect label={this.props.emptyText}
                resetLabel={this.props.emptyText} defaultValue={value}
                 onChange={this.handleSelectChange}>
                {this.props.options.map((option, i) => {
                  return (
                    <option key={i} dataValue={option.value}>{option.label}</option>
                  );
                })}
              </ReactMaterialSelect>
              <label htmlFor={this.props.name}  data-error={this.props.getErrorMessage()} data-success={this.props.successText}>{this.props.label}</label>

          </div>
            {note}
        </div>
    );
  }
}
export default HOC(Select);