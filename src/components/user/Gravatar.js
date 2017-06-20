//@flow
import React from 'react';
import crypto from 'crypto';

type Props = {
    email?: string,
    emailHash?: string,
    size: number
  }

  type DefaultProps = {
    size: number
  }

export default class Gravatar extends React.PureComponent<DefaultProps, Props, void> {

  props: Props

  static defaultProps: DefaultProps = {
    size: 30,
    emailHash: null,
    email: null
  }

  render() {
    var hash = null;
    let email:string = this.props.email ? this.props.email : '';
    let size: number = this.props.size ? this.props.size: 30;
    if(this.props.emailHash){
      hash = this.props.emailHash;
    }else{
      hash = crypto.createHash('md5')
         .update(email.toLowerCase())
         .digest("hex");
    } 

    var gravatarUrl = 'https://www.gravatar.com/avatar/' + hash;

    if(this.props.size){
      gravatarUrl += '?s=' + this.props.size * 2 + '&d=mm';
    }else{
      gravatarUrl +='?d=mm';
    }

    return (<img className="circle" height={size} width={size} style={{height: this.props.size.toString() + 'px', width: size.toString() + 'px', border: '1px solid #bbbbbb'}} src={gravatarUrl} alt="User Profile Photo" />);
  }
}
