import React from 'react';
import PropTypes from 'prop-types';
var Formsy = require('formsy-react');
var find = require('lodash.find');
var result = require('lodash.result');
var classNames = require('classnames');
var PureRenderMixin = require('react-addons-pure-render-mixin');

import ReactMaterialSelect from 'react-material-select';

var Select = React.createClass({

  mixins: [PureRenderMixin, Formsy.Mixin],

  propTypes:  {
    emptyText: PropTypes.string,
    defaultValue: PropTypes.string,
    name: PropTypes.string,
    className: PropTypes.string,
    options: PropTypes.array,
    dataTooltip: PropTypes.string,
    dataDelay: PropTypes.number,
    dataPosition: PropTypes.string,
    label: PropTypes.string,
    successText: PropTypes.string,
    id: PropTypes.string,
    onChange: PropTypes.func,
    startEmpty: PropTypes.bool,
    icon: PropTypes.string,
    note: PropTypes.string //optional note that displays below the select, will be updated on selection if option contains a note
  },

  getDefaultProps() {
    return {
      startEmpty: true,
      emptyText: 'Choose an Option',
      name: 'select-box',
      id: 'select-box',
      options: [],
      dataDelay: 100
    };
  },

  getInitialState(){
    return {
      note: this.props.note
    };
  },

  setNote(val){
    var note = result(find(this.props.options, {'value': val}), 'note');
    if(note){
      this.setState({note});
    }
  },

  handleSelectChange(selected) {
     var val = selected.value;
     this.setValue(val);
     this.setNote(val);
     if(this.props.onChange){
       this.props.onChange(val);
     }

   },

   componentWillMount() {
      this.setValue(this.props.defaultValue);
      this.setNote(this.props.defaultValue);
  },

  componentWillReceiveProps(nextProps){
    if(!nextProps.startEmpty && this.props.defaultValue != nextProps.defaultValue) {
      this.setValue(nextProps.defaultValue);
      this.setNote(nextProps.defaultValue);
    }
  },

   validate() {
     if(this.isRequired()){
       if(this.getValue() && this.getValue() !== ''){
         return true;
       }else{
         return false;
       }
     }else{
       return true;
     }

  },

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
                  return (<option key={i} dataValue={option.value}>{option.label}</option>);
                })}
              </ReactMaterialSelect>
              <label htmlFor={this.props.name}  data-error={this.getErrorMessage()} data-success={this.props.successText}>{this.props.label}</label>

          </div>
            {note}
        </div>
    );

  }
});

module.exports = Select;