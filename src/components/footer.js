var React = require('react');
var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');

var Footer = React.createClass({

  mixins:[StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  render() {

    var m4eFooter = '', about = '', services = '', journalists = '';
    if(!MAPHUBS_CONFIG.mapHubsPro){
      m4eFooter = (
        <ul style={{marginTop: '0px'}}>
          <li className="valign-wrapper">
            <a href="http://moabi.org" className="valign" style={{float: 'left', paddingRight: '5px'}}>
              <img width="75" height="75" style={{marginLeft: '-10px'}} src="/assets/moabi-logo.png" alt="Moabi.org" />
            </a>
            <span className="valign">{MAPHUBS_CONFIG.productName + this.__(' is a non-profit initiative of the Moabi organization')}</span>

          </li>
        </ul>
      );

      about = (
        <li><a href="/about">{this.__('About')}</a></li>
      );
      services = (
        <li><a href="/services">{this.__('Services')}</a></li>
      );
      journalists = (
        <li><a href="/journalists">{this.__('Journalists')}</a></li>
      );
    }else{
      about = (
        <li><a href="https://maphubs.com">{this.__('About')}</a></li>
      );
      services = (
        <li><a href="https://maphubs.com">{this.__('Services')}</a></li>
      );
    }


    return (
        <footer className="page-footer white">
          <div className="divider"></div>
          <div className="container">

            <div className="row">
              <div className="col l4 s12" style={{marginTop: '15px'}}>
                {m4eFooter}
                <ul>
                  <li className="valign-wrapper">
                    <a href="http://maphubs.com" className="valign" style={{float: 'left', paddingRight: '5px'}}>
                        <img width="111" height="30" src="/assets/maphubs-logo-small.png" alt="MapHubs.com" />
                      </a>
                      <span className="valign">{this.__('Powered by MapHubs')}</span>
                    </li>
                  <li>
                    {this.__('View the open source code on ')}<a href="https://github.com/maphubs">GitHub</a>
                  </li>
                </ul>

              </div>
              <div className="col l5 s12">

                <ul>
                  <li>{this.__('Contact Us')}</li>
                  <li><a className="text-darken-3 center" href="#" onClick={function(){HS.beacon.open();}}>{MAPHUBS_CONFIG.contactEmail}</a></li>
                  <li><a className="text-darken-3 center" href={'http://twitter.com/' + MAPHUBS_CONFIG.twitter}>@{MAPHUBS_CONFIG.twitter}</a></li>

                </ul>
              </div>
              <div className="col l3 s12">
                <ul>
                  <li>{this.__('Learn More')}</li>
                  {about}
                  {services}                                   
                  <li><a href="http://help.maphubs.com" target="_blank">{this.__('Help')}</a></li>
                  {journalists}                  
                  <li><a href="/terms">{this.__('Terms')}</a></li>
                  <li><a href="/privacy">{this.__('Privacy')}</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="footer-copyright white">
            <div className="grey-text container center">
              <small>&copy; 2017 {MAPHUBS_CONFIG.productName}</small>
            </div>
          </div>

      </footer>
    );
  }
});

module.exports = Footer;
