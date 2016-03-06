var React = require('react');

var Header = require('../components/header');

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
    locale: React.PropTypes.string.isRequired
  },
  render() {
    return (
      <div>
        <Header />
        <main className="container">
          <div className="row valign-wrapper">
            <div className="col s12 m8 l8 valign" style={{margin: 'auto'}}>
              <h4 className="center">{this.__('Email Confirmed')}</h4>
              <p>{this.__('Thank you for confirming your account! You are now ready to start using MapHubs!')}</p>

              <h5>Create (or Join) a Group</h5>

              <h5>Create or Upload a Map Layer</h5>

              <h5>Make a Map</h5>

              <h5>Post a Story</h5>

              <h5>Create (or Join) a Hub</h5>

            </div>
          </div>
      </main>
      </div>
    );
  }
});

module.exports = EmailConfirmation;
