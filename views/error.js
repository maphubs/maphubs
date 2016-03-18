var React = require('react');
var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');

var Header = require('../components/header');
var Footer = require('../components/footer');

var Error = React.createClass({

  mixins:[StateMixin.connect(LocaleStore, {initWithProps: ['locale']})],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    title: React.PropTypes.string,
		error: React.PropTypes.string,
		url: React.PropTypes.string,
    locale: React.PropTypes.string.isRequired
  },

  getDefaultProps() {
    return {
      story: {}
    };
  },


  render() {
    return (
      <div>
        <Header />
        <main>
          <div className="container s12">
            <h3 className="center-align">{this.props.title}</h3>
            <p className="flow-text center-align">{this.props.error}</p>
            <p className="flow-text center-align"><a href={this.props.url} target="_blank">{this.props.url}</a></p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
});

module.exports = Error;
