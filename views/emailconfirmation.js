var React = require('react');

var Header = require('../components/header');
var Footer = require('../components/footer');
var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');

var EmailConfirmation = React.createClass({

  mixins:[StateMixin.connect(LocaleStore, {initWithProps: ['locale']})],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    valid: React.PropTypes.bool,
    locale: React.PropTypes.string.isRequired
  },
  render() {
    var content = '';
    if(this.props.valid){
      content = (
        <div className="col s12 m8 l8 valign" style={{margin: 'auto'}}>
          <h4 className="center">{this.__('Email Confirmed')}</h4>
          <p>{this.__('Thank you for confirming your account!')}</p>
        </div>
      );
    }else{
      content = (
        <div className="col s12 m8 l8 valign" style={{margin: 'auto'}}>
          <h4 className="center">{this.__('Unable to Confirm Email')}</h4>
          <p>{this.__('This email may have already been confirmed. If you are unable to access your account please contact us at ')}<a href="#" onClick={function(){HS.beacon.open();}}>{MAPHUBS_CONFIG.contactEmail}</a></p>
        </div>
      );
    }

    return (
      <div>
        <Header />
        <main className="container">
          <div className="row valign-wrapper">
            {content}
          </div>
      </main>
      <Footer />
      </div>
    );
  }
});

module.exports = EmailConfirmation;
