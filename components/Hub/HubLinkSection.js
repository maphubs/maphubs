var React = require('react');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');
var config = require('../../clientconfig');
var urlUtil = require('../../services/url-util');

var HubLinkSection = React.createClass({

  mixins:[StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    hubid: React.PropTypes.string.isRequired
  },


render(){
  var omhBaseUrl = urlUtil.getBaseUrl(config.host, config.port);

  var hubBaseUrl = omhBaseUrl + '/hub/' + this.props.hubid;
  return (
    <div className="row" style={{marginBottom: '50px'}}>
      <div className="col s12 m4 l4 hub-icon-wrapper" style={{margin: 'auto'}}>
          <a href={hubBaseUrl + '/map'} style={{margin: 'auto'}}>
          <div className="valign-wrapper" style={{height: '125px', position: 'relative', margin: 'auto'}}>
              <i className="material-icons valign center-align" style={{fontSize: '80px', margin: 'auto'}}>map</i>
          </div>
          <h5 className="center-align">{this.__('Map')}</h5>
        </a>
      </div>
      <div className="col s12 m4 l4 hub-icon-wrapper" style={{margin: 'auto'}}>
        <a href={hubBaseUrl + '/stories'} style={{margin: 'auto'}}>
          <div className="valign-wrapper" style={{height: '125px', position: 'relative', margin: 'auto'}}>
              <i className="material-icons valign center-align" style={{fontSize: '80px', margin: 'auto'}}>library_books</i>
          </div>
          <h5 className="center-align">{this.__('Stories')}</h5>
        </a>
      </div>
      <div className="col s12 m4 l4 hub-icon-wrapper" style={{margin: 'auto'}}>
        <a href={hubBaseUrl + '/resources'} style={{margin: 'auto'}}>
          <div className="valign-wrapper" style={{height: '125px', position: 'relative', margin: 'auto'}}>
              <i className="material-icons valign center-align" style={{fontSize: '80px', margin: 'auto'}}>attach_file</i>
          </div>
          <h5 className="center-align">{this.__('Resources')}</h5>
        </a>
      </div>

    </div>
  );
}

});

module.exports = HubLinkSection;
