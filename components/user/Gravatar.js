var React = require('react');

var crypto = require('crypto');

var Gravatar = React.createClass({

  propTypes:  {
    email: React.PropTypes.string.isRequired,
    size: React.PropTypes.number
  },

  render() {
    var hash = crypto.createHash('md5')
          .update(this.props.email.trim().toLowerCase())
          .digest("hex");

    var gravatarUrl = 'https://www.gravatar.com/avatar/' + hash;

    if(this.props.size){
      gravatarUrl += '?s=' + this.props.size;
    }

    return (<img height="30" width="30" style={{height: '30px', width: '30px'}} src={gravatarUrl} alt="User Profile Photo" />);
  }
});

module.exports = Gravatar;
