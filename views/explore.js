var React = require('react');

var Header = require('../components/header');
var Footer = require('../components/footer');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');

var Explore = React.createClass({

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
            <div className="row" style={{marginTop: '35px', marginBottom: '35px'}}>
              <h5 className="center center-align">{this.__('Read map stories, explore hubs, and search for data')}</h5>
            </div>
            <div className="divider"></div>
            <div className="row" style={{height: '450px', marginTop: '35px', marginBottom: '35px'}}>
              <div className="col s4">
                <h5>{this.__('Read Map Stories')}</h5>
                <a href='/stories' className="btn">{this.__('View Recent Stories')}</a>
              </div>
              <div className="col s8">
                <div style={{margin: 'auto', display: 'block'}}>
                  <img className="responsive-img" src="/assets/screenshots/view_stories.png" />
                </div>
              </div>
            </div>
            <div className="divider"></div>
            <div className="row" style={{height: '450px', marginTop: '35px', marginBottom: '35px'}}>
              <div className="col s4">
                <h5>{this.__('Explore Hubs')}</h5>
                <a href='/hubs' className="btn">{this.__('View Hubs')}</a>
              </div>
              <div className="col s8">
                <div style={{margin: 'auto', display: 'block'}}>
                  <img className="responsive-img" src="/assets/screenshots/view_hubs.png" />
                </div>
              </div>
            </div>
            <div className="divider"></div>
            <div className="row" style={{height: '450px', marginTop: '35px', marginBottom: '35px'}}>
              <div className="col s4">
                <h5>{this.__('Search for Data')}</h5>
                <a href='/search' className="btn">{this.__('Search MapHubs')}</a>
              </div>
              <div className="col s8">
                <div style={{margin: 'auto', display: 'block'}}>
                  <img className="responsive-img" src="/assets/screenshots/search.png" />
                </div>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      );


  }
});

module.exports = Explore;
