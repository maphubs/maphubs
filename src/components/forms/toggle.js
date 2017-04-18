import React from 'react';
import PropTypes from 'prop-types';
var Formsy = require('formsy-react');
var classNames = require('classnames');
var $ = require('jquery');
var PureRenderMixin = require('react-addons-pure-render-mixin');
var debug = require('../../services/debug')('Toggle');

var Toggle= React.createClass({

  mixins: [PureRenderMixin, Formsy.Mixin],


  propTypes:  {
    className: PropTypes.string,
    dataTooltip: PropTypes.string,
    dataDelay: PropTypes.number,
    dataPosition: PropTypes.string,
    labelOn: PropTypes.string.isRequired,
    labelOff: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    style: PropTypes.object,
    disabled: PropTypes.bool,
    onChange: PropTypes.func,
    defaultChecked: PropTypes.bool,
    checked: PropTypes.bool
  },


  getDefaultProps() {
    return {
      style: {},
      defaultChecked: false,
      dataDelay: 100,
      disabled: false
    };
  },

  changeValue(event) {
    
    event.stopPropagation();
    var checked = event.currentTarget.checked;
    debug('change value: ' + checked);
    if(checked !== this.getValue())
     this.setValue(checked);
     if(this.props.onChange){this.props.onChange(event.currentTarget.checked);}
   },


  componentWillMount() {
    if ('checked' in this.props) {
      this.setValue(this.props.checked);
    }else{
      this.setValue(this.props.defaultChecked);  
    }       
  },

  componentDidMount(){
    if(this.props.dataTooltip){
      $(this.refs.toggle).tooltip();
    }   
  },

  componentWillReceiveProps(nextProps) {
    var currentValue =  this.props.checked;
    if ('checked' in nextProps 
    && nextProps.checked !== currentValue){
         this.setValue(nextProps.checked);
    }   
  },

   componentDidUpdate(prevProps){
    if(!prevProps.dataTooltip && this.props.dataTooltip){
      $(this.refs.toggle).tooltip();
    }
  },

/*
  handleChange(event, value) {
    this.setValue(value);
    if (this.props.onChange) this.props.onChange(event, value);
  },
*/

  render() {
    const props = { ...this.props };
    // Remove React warning.
    // Warning: Input elements must be either controlled or uncontrolled
    // (specify either the value prop, or the defaultValue prop, but not both).
    delete props.defaultChecked;

    var className = classNames('switch', this.props.className, {tooltipped: this.props.dataTooltip ? true : false});

    let checked = this.getValue();

    if (typeof checked === 'boolean') {
      checked = checked ? 1 : 0;
    }

    return (
      <div ref="toggle" className={className} disabled={props.disabled} data-delay={props.dataDelay} data-position={props.dataPosition}
          style={props.style}
          data-tooltip={props.dataTooltip}>
        <label>
          {props.labelOff}
          <input type="checkbox" id={props.name} checked={!!checked} disabled={props.disabled} onChange={this.changeValue}/>
          <span className="lever"></span>
          {props.labelOn}
        </label>
      </div>
    );
  }
});

module.exports = Toggle;
