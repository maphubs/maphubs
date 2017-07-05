//@flow
import React from 'react';

type Props = {
    picture: string,
    size: number
  }

  type DefaultProps = {
    size: number
  }

export default class UserIcon extends React.PureComponent<DefaultProps, Props, void> {

  props: Props

  static defaultProps: DefaultProps = {
    size: 30
  }

  render() {
    return (
    <img className="circle" 
    height={this.props.size} width={this.props.size} 
    style={{
      height: this.props.size.toString() + 'px', 
      width: this.props.size.toString() + 'px', 
      border: '1px solid #bbbbbb'
      }} 
    src={this.props.picture} alt="User Profile Photo" />);
  }
}
