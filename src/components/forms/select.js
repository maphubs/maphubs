//@flow
import React from 'react';

import {HOC} from 'formsy-react';
import find from 'lodash.find';
import result from 'lodash.result';
var classNames = require('classnames');

import ReactMaterialSelect from 'react-material-select';
import MapHubsPureComponent from '../MapHubsPureComponent';

class Select extends MapHubsPureComponent {

  propTypes:  {
    emptyText: string,
    defaultValue: string,
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
    note: string //optional note that displays below the select, will be updated on selection if option contains a note
  }

  static defaultProps: {
    startEmpty: true,
    emptyText: 'Choose an Option',
    name: 'select-box',
    id: 'select-box',
    options: [],
    dataDelay: 100
  }

  constructor(props: Object){
    super(props);
    this.state = {
      note: props.note
    };
  }

  componentWillMount() {
    this.setValue(this.props.defaultValue);
    this.setNote(this.props.defaultValue);
  }

  componentWillReceiveProps(nextProps){
    if(!nextProps.startEmpty && this.props.defaultValue !== nextProps.defaultValue) {
      this.setValue(nextProps.defaultValue);
      this.setNote(nextProps.defaultValue);
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
     this.setValue(val);
     this.setNote(val);
     if(this.props.onChange){
       this.props.onChange(val);
     }
   }

   validate = () => {
     if(this.isRequired()){
       if(this.getValue() && this.getValue() !== ''){
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
    var value = this.getValue();

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
                {this.props.options.map(function(option, i){
                  return (
                    <option key={i} dataValue={option.value}>{option.label}</option>
                  );
                })}
              </ReactMaterialSelect>
              <label htmlFor={this.props.name}  data-error={this.getErrorMessage()} data-success={this.props.successText}>{this.props.label}</label>

          </div>
            {note}
        </div>
    );
  }
}
export default HOC(Select);