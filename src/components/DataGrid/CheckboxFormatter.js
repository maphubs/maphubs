//@flow
import React from 'react';

type Props = {
  value: ?boolean
}

export default class CheckboxFormatter extends React.Component<void, Props, void> {
  props: Props

  render(){
    const value = this.props.value;
    if(typeof value === 'undefined' || value === null){
      return (<span></span>);
    }else if(value){
      return (
        <i className="material-icons green-text" style={{fontSize: '14px', margin: 'auto'}}>check</i>
      );
    }else{
      return (
        <i className="material-icons red-text" style={{fontSize: '14px', margin: 'auto'}}>close</i>
      );
    }

  }
}