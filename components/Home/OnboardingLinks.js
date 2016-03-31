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
    <div className="container">
      <div className="row no-margin">
        <h5 className="center-align" style={{color: '#212121', marginTop: '20px'}}>{this.__('Mapping for Everyone')}</h5>
      </div>
    <div className="row">
        <div className="col s12 m4 l4 home-onboarding-icon-wrapper" style={{margin: 'auto'}}>
          <a href="/get-started/share-data" style={{margin: 'auto'}}>
            <div className="valign-wrapper" style={{height: '125px', position: 'relative', margin: 'auto'}}>
              <i className="material-icons valign center-align" style={{fontSize: '80px', margin: 'auto'}}>map</i>
            </div>
            <h5 className="center-align">{this.__('Share Data')}</h5>
          </a>
        </div>
        <div className="col s12 m4 l4 home-onboarding-icon-wrapper" style={{margin: 'auto'}}>
          <a href="/get-started/tell-your-story" style={{margin: 'auto'}}>
            <div className="valign-wrapper" style={{height: '125px', position: 'relative', margin: 'auto'}}>
              <i className="material-icons valign center-align" style={{fontSize: '80px', margin: 'auto'}}>chat_bubble</i>
            </div>
            <h5 className="center-align">{this.__('Tell Your Story')}</h5>
          </a>
        </div>
        <div className="col s12 m4 l4 home-onboarding-icon-wrapper" style={{margin: 'auto'}}>
          <a href="/get-started/explore" style={{margin: 'auto'}}>
            <div className="valign-wrapper" style={{height: '125px', position: 'relative', margin: 'auto'}}>
                <i className="material-icons valign center-align" style={{fontSize: '80px', margin: 'auto'}}>explore</i>
            </div>
            <h5 className="center-align">{this.__('Explore')}</h5>
          </a>
        </div>
      </div>
      <div className="row">
      <p className="center center-align">
        {this.__('MapHubs is a home for the world\'s open map data and an easy tool for making and sharing maps. Our mission is to help you tell your story using maps and to foster communities around topics that matter.')}
      </p>
      </div>


    </div>
  );
}

});

module.exports = OnboardingLinks;
