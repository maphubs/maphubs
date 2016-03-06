var React = require('react');

var urlUtil = require('../services/url-util');
var config = require('../clientconfig');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');

var OAuthDialog = React.createClass({

  mixins:[StateMixin.connect(LocaleStore, {initWithProps: ['locale']})],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    locale: React.PropTypes.string.isRequired,
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
    var baseUrl = urlUtil.getBaseUrl(config.host, config.port);
    var callbackUrl = baseUrl + '/edit/land.html';
    return (
      <div className="container">
        <p>Hi {this.props.user}!</p>
        <p><b>{this.props.client}</b> {this.__('is requesting access to your account')}</p>
        <p>{this.__('Do you approve?')}</p>

        <form action="/dialog/authorize/decision" method="post">
          <input name="transaction_id" type="hidden" value={this.props.transactionID}/>
          <input type="hidden" name="oauth_callback" id="oauth_callback" value={callbackUrl} />
          <div>
            <input type="submit" value="Allow" id="allow"/>
            <input type="submit" value="Deny" name="cancel" id="deny"/>
          </div>
        </form>

      </div>
    );
  }
});

module.exports = OAuthDialog;
