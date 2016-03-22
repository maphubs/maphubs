var React = require('react');

var Header = require('../components/header');
var Footer = require('../components/footer');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');

var ShareData = React.createClass({

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
              <h5 className="center center-align">{this.__('Create a Group and Upload Your Data')}</h5>
            </div>
            <div className="divider"></div>
            <div className="row" style={{height: '450px', marginTop: '35px', marginBottom: '35px'}}>
              <div className="col s4">
                <h5>{this.__('Create or join a group')}</h5>
                  <ol>
                    <li>{this.__('First login or register for an account:')}
                      <ul>
                      <li><a target="_blank" href="/login">{this.__('Login')}</a></li>
                      <li><a target="_blank" href="/signup">{this.__('Register')}</a></li>
                      </ul>
                    </li>
                    <li>{this.__('Next, use the link below to go to the Groups page.')}</li>
                    <li>{this.__('Click the red add button to create a group.')}</li>
                  </ol>
                <a href='/groups' className="btn">{this.__('Go to Groups')}</a>
              </div>
              <div className="col s8">
                <div style={{margin: 'auto', display: 'block'}}>
                  <img className="responsive-img" src="/assets/screenshots/create_group.png" />
                </div>
              </div>
            </div>
            <div className="divider"></div>
            <div className="row" style={{height: '450px', marginTop: '35px', marginBottom: '35px'}}>
              <div className="col s4">
                <h5>{this.__('Create a layer')}</h5>
                  <ol>
                    <li>{this.__('First login or register for an account:')}
                      <ul>
                      <li><a target="_blank" href="/login">{this.__('Login')}</a></li>
                      <li><a target="_blank" href="/signup">{this.__('Register')}</a></li>
                      </ul>
                    </li>
                    <li>{this.__('Next, use the link below to go to the Layers page.')}</li>
                    <li>{this.__('Click the red add button to create a layer.')}</li>
                  </ol>
                <a href='/createlayer' className="btn">{this.__('Create a Layer')}</a>
              </div>
              <div className="col s8">
                <div style={{margin: 'auto', display: 'block'}}>
                  <img className="responsive-img" src="/assets/screenshots/create_layer.png" />
                </div>
              </div>
            </div>
            <div className="divider"></div>
            <div className="row" style={{height: '450px', marginTop: '35px', marginBottom: '35px'}}>
              <div className="col s4">
                <h5>{this.__('Make a map story')}</h5>
                  <ol>
                    <li>{this.__('First login or register for an account:')}
                      <ul>
                      <li><a target="_blank" href="/login">{this.__('Login')}</a></li>
                      <li><a target="_blank" href="/signup">{this.__('Register')}</a></li>
                      </ul>
                    </li>
                    <li>{this.__('Next, use the link below to go to the Stories page.')}</li>
                    <li>{this.__('Click the red add button to go you My Stories page.')}</li>
                    <li>{this.__('Then click the red add button to create your first story.')}</li>
                  </ol>
                  <a href={'/stories'} className="btn">{this.__('Go to Stories')}</a>
              </div>
              <div className="col s8">
                <div style={{margin: 'auto', display: 'block'}}>
                  <img className="responsive-img" src="/assets/screenshots/map_story.png" />
                </div>
              </div>
            </div>
            <div className="divider"></div>
            <div className="row" style={{height: '450px', marginTop: '35px', marginBottom: '35px'}}>
              <div className="col s4">
                <h5>{this.__('Create a Hub')}</h5>
                  <ol>
                    <li>{this.__('First login or register for an account:')}
                      <ul>
                      <li><a target="_blank" href="/login">{this.__('Login')}</a></li>
                      <li><a target="_blank" href="/signup">{this.__('Register')}</a></li>
                      </ul>
                    </li>
                    <li>{this.__('Next, use the link below to create a hub')}</li>
                  </ol>
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

module.exports = ShareData;
