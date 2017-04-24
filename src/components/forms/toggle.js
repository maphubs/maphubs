//@flow
import React from 'react';
import {HOC} from 'formsy-react';
var classNames = require('classnames');
var $ = require('jquery');
var debug = require('../../services/debug')('Toggle');
import MapHubsPureComponent from '../MapHubsPureComponent';

class Toggle extends MapHubsPureComponent {

  props:  {
    className: string,
    dataTooltip: string,
    dataDelay: number,
    dataPosition: string,
    labelOn: string,
    labelOff: string,
    name: string,
    style: Object,
    disabled: boolean,
    onChange: Function,
    defaultChecked: boolean,
    checked: boolean,
    setValue: Function,
    getValue: Function
  }

  static defaultProps = {
    style: {},
    defaultChecked: false,
    dataDelay: 100,
    disabled: false
  }

  componentWillMount() {
    super.componentWillMount();
    if ('checked' in this.props) {
      this.props.setValue(this.props.checked);
    }else{
      this.props.setValue(this.props.defaultChecked);  
    }       
  }

  componentDidMount(){
    if(this.props.dataTooltip){
      $(this.refs.toggle).tooltip();
    }   
  }

  componentWillReceiveProps(nextProps) {
    var currentValue =  this.props.checked;
    if ('checked' in nextProps 
    && nextProps.checked !== currentValue){
         this.props.setValue(nextProps.checked);
    }   
  }

  componentDidUpdate(prevProps){
    if(!prevProps.dataTooltip && this.props.dataTooltip){
      $(this.refs.toggle).tooltip();
    }
  }

  changeValue = (event) => {    
    event.stopPropagation();
    var checked = event.currentTarget.checked;
    debug('change value: ' + checked);
    if(checked !== this.props.getValue())
     this.props.setValue(checked);
     if(this.props.onChange){this.props.onChange(event.currentTarget.checked);}
   }

  render() {
    const props = { ...this.props };
    // Remove React warning.
    // Warning: Input elements must be either controlled or uncontrolled
    // (specify either the value prop, or the defaultValue prop, but not both).
    delete props.defaultChecked;

    var className = classNames('switch', this.props.className, {tooltipped: this.props.dataTooltip ? true : false});

    let checked = this.props.getValue();

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
}
export default HOC(Toggle);