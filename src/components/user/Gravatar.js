import React from 'react';
import PropTypes from 'prop-types';

var crypto = require('crypto');

var Gravatar = React.createClass({

  propTypes:  {
    email: PropTypes.string,
    emailHash: PropTypes.string,
    size: PropTypes.number
  },

  getDefaultProps(){
    return {
      size: 30
    };
  },

  render() {
    var hash = null;
    if(this.props.emailHash){
      hash = this.props.emailHash;
    }else{
      hash = crypto.createHash('md5')
         .update(this.props.email.trim().toLowerCase())
         .digest("hex");
    }

    var gravatarUrl = 'https://www.gravatar.com/avatar/' + hash;

    if(this.props.size){
      gravatarUrl += '?s=' + this.props.size * 2 + '&d=mm';
    }else{
      gravatarUrl +='?d=mm';
    }

    return (<img className="circle" height={this.props.size} width={this.props.size} style={{height: this.props.size + 'px', width: this.props.size + 'px', border: '1px solid #bbbbbb'}} src={gravatarUrl} alt="User Profile Photo" />);
  }
});

module.exports = Gravatar;
