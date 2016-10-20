var React = require('react');
var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');
var config = require('../clientconfig');

var Footer = React.createClass({

  mixins:[StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  render() {

    return (
        <footer className="page-footer white">
          <div className="divider"></div>
          <div className="container">

            <div className="row">
              <div className="col l4 s12" style={{marginTop: '15px'}}>
                <a href="http://moabi.org">
                  <img width="50" height="50" className="responsive-img" style={{marginLeft: '-10px'}} src="/assets/moabi-logo.png" alt="Moabi.org" /></a>
                  <br />
                  <small>{config.productName + this.__(' is a Moabi project')}</small>
                  <br />
                  <small>{this.__('View the open source code on ')}<a href="https://github.com/maphubs">GitHub</a></small>

              </div>
              <div className="col l5 s12">

                <ul>
                  <li>{this.__('Contact Us')}</li>
                  <li><a className="text-darken-3 center" href="#" onClick={function(){HS.beacon.open();}}>{config.contactEmail}</a></li>
                  <li><a className="text-darken-3 center" href={'http://twitter.com/' + config.twitter}>@{config.twitter}</a></li>

                </ul>
              </div>
              <div className="col l3 s12">
                <ul>
                  <li>{this.__('Learn More')}</li>
                  <li><a href="/about">{this.__('About')}</a></li>
                  <li><a href="/services">{this.__('Services')}</a></li>
                  <li><a href="/help">{this.__('Help')}</a></li>
                  <li><a href="/journalists">{this.__('Journalists')}</a></li>
                  <li><a href="/terms">{this.__('Terms')}</a></li>
                  <li><a href="/privacy">{this.__('Privacy')}</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="footer-copyright white">
            <div className="grey-text container center">
              <small>&copy; 2016 {config.productName}</small>
            </div>
          </div>

      </footer>
    );
  }
});

module.exports = Footer;
