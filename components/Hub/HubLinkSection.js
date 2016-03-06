var React = require('react');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');

var HubLinkSection = React.createClass({

  mixins:[StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

render(){
  return (
    <div className="row" style={{marginBottom: '50px'}}>
      <div className="col s12 m4 l4" style={{margin: 'auto'}}>
          <div className="valign-wrapper" style={{height: '125px', position: 'relative', margin: 'auto'}}>
            <a href="map" style={{margin: 'auto'}}>
              <i className="material-icons omh-accent-text valign center-align" style={{fontSize: '80px'}}>map</i>
            </a>
          </div>
        <a href="map">
          <h5 className="center-align" style={{color: '#212121'}}>{this.__('Map')}</h5>
        </a>
      </div>
      <div className="col s12 m4 l4" style={{margin: 'auto'}}>
          <div className="valign-wrapper" style={{height: '125px', position: 'relative', margin: 'auto'}}>
            <a href="stories" style={{margin: 'auto'}}>
              <i className="material-icons omh-accent-text valign center-align" style={{fontSize: '80px'}}>library_books</i>
            </a>
          </div>
        <a href="stories">
          <h5 className="center-align" style={{color: '#212121'}}>{this.__('Stories')}</h5>
        </a>
      </div>
      <div className="col s12 m4 l4" style={{margin: 'auto'}}>
        <div className="valign-wrapper" style={{height: '125px', position: 'relative', margin: 'auto'}}>
          <a href="resources" style={{margin: 'auto'}}>
            <i className="material-icons omh-accent-text valign center-align" style={{fontSize: '80px'}}>attach_file</i>
          </a>
        </div>
        <a href="resources">
          <h5 className="center-align" style={{color: '#212121'}}>{this.__('Resources')}</h5>
        </a>
      </div>

    </div>
  );
}

});

module.exports = HubLinkSection;
