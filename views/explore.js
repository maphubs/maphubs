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
            <div className="row" style={{height: '300px', marginTop: '35px', marginBottom: '35px'}}>
              <div className="col s4">
                <h5>{this.__('Read map stories')}</h5>
                <p>{this.__('Some Text Here')}</p>
                <p>{this.__('Read the the tutorial linked to the right, or click below to get started.')}</p>
                <a href='/stories' className="btn">View Recent Stories</a>
              </div>
              <div className="col s8">
                <div style={{margin: 'auto', display: 'block'}}>
                  <script async src="https://static.medium.com/embed.js"></script><a className="m-story" data-collapsed="true" data-width="100%" href="https://medium.com/@maphubs/maphubs-features-271396947d6e">MapHubs Features</a>
                </div>
              </div>
            </div>
            <div className="divider"></div>
            <div className="row" style={{height: '300px', marginTop: '35px', marginBottom: '35px'}}>
              <div className="col s4">
                <h5>{this.__('Explore hubs')}</h5>
                <p>{this.__('Some Text Here')}</p>
                <p>{this.__('Read the the tutorial linked to the right, or click below to get started.')}</p>
                <a href='/hubs' className="btn">View Hubs</a>
              </div>
              <div className="col s8">
                <div style={{margin: 'auto', display: 'block'}}>
                  <script async src="https://static.medium.com/embed.js"></script><a className="m-story" data-collapsed="true" data-width="100%" href="https://medium.com/@maphubs/maphubs-features-271396947d6e">MapHubs Features</a>
                </div>
              </div>
            </div>
            <div className="divider"></div>
            <div className="row" style={{height: '300px', marginTop: '35px', marginBottom: '35px'}}>
              <div className="col s4">
                <h5>{this.__('Search for data')}</h5>
                <p>{this.__('Some Text Here')}</p>
                <p>{this.__('Read the the tutorial linked to the right, or click below to get started.')}</p>
                <a href='/' className="btn">Search MapHubs</a>
              </div>
              <div className="col s8">
                <div style={{margin: 'auto', display: 'block'}}>
                  <script async src="https://static.medium.com/embed.js"></script><a className="m-story" data-collapsed="true" data-width="100%" href="https://medium.com/@maphubs/maphubs-features-271396947d6e">MapHubs Features</a>
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
