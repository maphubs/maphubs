var React = require('react');

var OAuth2Dialog = React.createClass({

  propTypes: {
    user: React.PropTypes.string,
    client: React.PropTypes.string,
    transactionID: React.PropTypes.string
  },

  getDefaultProps() {
    return {
      user: 'Unknown',
      client: 'Unknown',
      transactionID: ''
    };
  },

  render() {
    return (
      <div>
        <p>Hi {this.props.user}!</p>
        <p><b>{this.props.client}</b> is requesting access to your account.</p>
        <p>Do you approve?</p>
        <form action="/oauth2/dialog/authorize/decision" method="post">
          <input name="transaction_id" type="hidden" value="<%= transactionID %>" />
          <div>
          <input type="submit" value="Allow" id="allow" />
          <input type="submit" value="Deny" name="cancel" id="deny" />
          </div>
        </form>
    </div>
);
}
});

module.exports = OAuth2Dialog;
