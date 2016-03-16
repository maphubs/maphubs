var React = require('react');

var Header = require('../components/header');
var Footer = require('../components/footer');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../stores/LocaleStore');
var UserStore = require('../stores/UserStore');
var Locales = require('../services/locales');

var TellYourStory = React.createClass({

  mixins:[StateMixin.connect(UserStore), StateMixin.connect(LocaleStore, {initWithProps: ['locale']})],

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
              <h5 className="center center-align">{this.__('Make a map, write story explaining your maps, or build website called a \'hub\' to host a collection of stories and your own interactive map')}</h5>
            </div>
            <div className="divider"></div>
            <div className="row" style={{height: '300px', marginTop: '35px', marginBottom: '35px'}}>
              <div className="col s4">
                <h5>{this.__('Make a map')}</h5>
                <a href={'/user/' + this.state.user.display_name + '/maps'} className="btn">{this.__('Go to My Maps')}</a>
              </div>
              <div className="col s8">
                <div style={{margin: 'auto', display: 'block'}}>
                  <img className="responsive-img" src="/assets/screenshots/create_map.png" />
                </div>
              </div>
            </div>
            <div className="divider"></div>
            <div className="row" style={{height: '300px', marginTop: '35px', marginBottom: '35px'}}>
              <div className="col s4">
                <h5>{this.__('Make a map story')}</h5>
                <a href={'/user/' + this.state.user.display_name + '/stories'} className="btn">{this.__('Go to My Stories')}</a>
              </div>
              <div className="col s8">
                <div style={{margin: 'auto', display: 'block'}}>
                  <img className="responsive-img" src="/assets/screenshots/map_story.png" />
                </div>
              </div>
            </div>
            <div className="divider"></div>
            <div className="row" style={{height: '300px', marginTop: '35px', marginBottom: '35px'}}>
              <div className="col s4">
                <h5>{this.__('Create a Hub')}</h5>
                <a href='/createhub' className="btn">{this.__('Create a Hub')}</a>
              </div>
              <div className="col s8">
                <div style={{margin: 'auto', display: 'block'}}>
                  <img className="responsive-img" src="/assets/screenshots/create_hub.png" />
                </div>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      );


  }
});

module.exports = TellYourStory;
