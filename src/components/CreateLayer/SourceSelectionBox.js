import React from 'react';
import PropTypes from 'prop-types';

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../../stores/LocaleStore');
var LocaleMixin = require('../LocaleMixin');

var SourceSelectionBox = React.createClass({

   mixins:[StateMixin.connect(LocaleStore), LocaleMixin],

  propTypes: {
    onSelect: PropTypes.func.isRequired,
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    icon: PropTypes.string,
    selected: PropTypes.bool
  },

  getDefaultProps(){
    return {
      selected: false
    };
  },

  getInitialState() {
    return {
      selected: this.props.selected
    };
  },

  componentWillReceiveProps(nextProps){
    if(nextProps.selected !== this.state.selected){
      this.setState({selected: nextProps.selected});
    }
  },

  onSelect(){
    this.props.onSelect(this.props.value);
  },
   
  render() {

    var icon = '';  
    if(this.props.icon){
      icon = (<i className="material-icons white-text" style={{fontSize: '48px'}}>{this.props.icon}</i>);
    }
    
    return (
      <div className="card-panel center omh-color" style={{width: '125px', height: '125px', padding: '10px', marginLeft: 'auto', marginRight: 'auto'}}
        onClick={this.onSelect}>
        
        <form action="#" style={{height: '100%', position: 'relative'}} >
          {icon}
          <p className="no-margin white-text" style={{position: 'absolute', bottom: '0'}}>
          <input type="checkbox" className="filled-in" id={this.props.name + '-checkbox'} onChange={this.onSelect} checked={this.state.selected ? 'checked' : null} />
          <label className="white-text" htmlFor={this.props.name + '-checkbox'}>{this.props.name}</label>
        </p>
        </form>
        
      </div>
    );
   }

});

module.exports = SourceSelectionBox;
