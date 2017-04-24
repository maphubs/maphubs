//@flow
import React from 'react';
import {HOC} from 'formsy-react';
import classNames from 'classnames';
import MapHubsPureComponent from '../MapHubsPureComponent';

class Radio extends MapHubsPureComponent {

  props: {
    className: string,
    dataTooltip: string,
    dataDelay: number,
    dataPosition: string,
    defaultValue: string,
    label: string,
    name: string,
    onChange: Function,
    options: Array<Object>,
    setValue: Function,
    getValue: Function
  }

  static defaultProps = {
    options: {},
    defaultValue: null,
    dataDelay: 100
  }

  componentWillMount() {
    super.componentWillMount();
    this.props.setValue(this.props.defaultValue);
  }

  changeValue = (event) => {
    this.props.setValue(event.target.id);
    if(this.props.onChange){
      this.props.onChange(event.target.id);
    }
  }

  render() {
     var className = classNames(this.props.className, {tooltipped: this.props.dataTooltip ? true : false});
     var value = this.props.getValue();
     var name = this.props.name;
     var _this = this;

    return (
          <div className={className} data-delay={this.props.dataDelay} data-position={this.props.dataPosition}
              data-tooltip={this.props.dataTooltip}>

            <label>{this.props.label}</label>
              {this.props.options.map((option) => {
                var checked = false;
                if(option.value === value){
                  checked = true;
                }
                return (<p key={option.value}>
                  <input  name={name} type="radio" id={option.value} onChange={_this.changeValue} checked={checked}/>
                  <label htmlFor={option.value}>{option.label}</label>
                </p>);
              })}
            </div>
    );
  }
}
export default HOC(Radio);