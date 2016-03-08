var React = require('react');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');

var OnboardingLinks = React.createClass({

  mixins:[StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

render(){
  return (
    <div className="container" style={{marginBottom: '35px', marginTop: '50px'}}>
      <div className="row">
        <h5 className="center-align" style={{color: '#212121'}}>{this.__('Mapping for Everyone')}</h5>
      </div>
    <div className="row">
        <div className="col s12 m4 l4" style={{margin: 'auto'}}>
            <div className="valign-wrapper" style={{height: '125px', position: 'relative', margin: 'auto'}}>
              <a href="/get-started/share-data" style={{margin: 'auto'}}>
                <i className="material-icons omh-accent-text valign center-align" style={{fontSize: '80px'}}>map</i>
              </a>
            </div>
          <a href="/get-started/share-data">
            <h5 className="center-align" style={{color: '#212121'}}>{this.__('Share Data')}</h5>
          </a>
        </div>
        <div className="col s12 m4 l4" style={{margin: 'auto'}}>
            <div className="valign-wrapper" style={{height: '125px', position: 'relative', margin: 'auto'}}>
              <a href="/get-started/tell-your-story" style={{margin: 'auto'}}>
                <i className="material-icons omh-accent-text valign center-align" style={{fontSize: '80px'}}>chat_bubble</i>
              </a>
            </div>
          <a href="/get-started/tell-your-story">
            <h5 className="center-align" style={{color: '#212121'}}>{this.__('Tell Your Story')}</h5>
          </a>
        </div>
        <div className="col s12 m4 l4" style={{margin: 'auto'}}>
          <div className="valign-wrapper" style={{height: '125px', position: 'relative', margin: 'auto'}}>
            <a href="/get-started/explore" style={{margin: 'auto'}}>
              <i className="material-icons omh-accent-text valign center-align" style={{fontSize: '80px'}}>explore</i>
            </a>
          </div>
          <a href="/get-started/explore">
            <h5 className="center-align" style={{color: '#212121'}}>{this.__('Explore')}</h5>
          </a>
        </div>
      </div>
      <div className="row">
      <p className="center center-align">{this.__('Our mission is to help you tell your story using maps and to foster communities (MapHubs) around important topics. MapHubs is a repository for the world\'s public and open source map data, and provides a simple tool to make shareable maps.')}</p>
      </div>


    </div>
  );
}

});

module.exports = OnboardingLinks;
