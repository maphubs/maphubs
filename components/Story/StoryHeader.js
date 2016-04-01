var React = require('react');

var config = require('../../clientconfig');
var urlUtil = require('../../services/url-util');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');
var moment = require('moment-timezone');
var Gravatar = require('../user/Gravatar');

import {addLocaleData, IntlProvider, FormattedRelative} from 'react-intl';
import en from 'react-intl/locale-data/en';
import es from 'react-intl/locale-data/es';
import fr from 'react-intl/locale-data/fr';

addLocaleData(en);
addLocaleData(es);
addLocaleData(fr);

var StoryHeader = React.createClass({

  mixins:[StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    story: React.PropTypes.object.isRequired,
    baseUrl: React.PropTypes.string
  },

  getDefaultProps(){
    return {
      baseUrl: ''
    };
  },


  render(){

    var linkUrl = '';
    var author = '';
    var userImage='';
    var guessedTz = moment.tz.guess();
    var updatedTime = moment.tz(this.props.story.updated_at, guessedTz).format();
    if(this.props.story.display_name){
      if(this.props.story.emailhash){
        userImage = (
            <Gravatar size={36} emailHash={this.props.story.emailhash} />

        );
      }
      var baseUrl = urlUtil.getBaseUrl(config.host, config.port);
      linkUrl = baseUrl + '/user/' + this.props.story.display_name;
      author = (
        <div style={{height: '40px', marginBottom: '10px', width: '100%'}}>
          <div className="valign-wrapper" style={{width: '36px', float: 'left'}}>
            <a className="valign" style={{marginTop: '4px'}} href={linkUrl + '/stories'}>{userImage}</a>
          </div>
          <div style={{marginLeft: '46px', width: 'calc(100% - 46px)'}}>
            <p style={{fontSize: '14px', margin: 0, lineHeight: '1.4rem'}} className="truncate"><a className="valign" style={{marginTop: 0, marginBottom: 0, marginLeft: '5px', fontSize: '14px', lineHeight: '1.4rem'}} href={linkUrl + '/stories'}>{this.props.story.display_name}</a></p>
            <p style={{fontSize: '14px', margin: 0, lineHeight: '1.4rem'}}>
              <IntlProvider locale={this.state.locale}>
                <FormattedRelative value={updatedTime}/>
              </IntlProvider>
            </p>
          </div>
        </div>
      );
    }else if(this.props.story.hub_id){
      var hubLogoUrl = '/hub/' + this.props.story.hub_id + '/images/logo/thumbnail';
      userImage = (
          <img className="circle valign" height="36" width="36" style={{height: '36px', width: '36px', border: '1px solid #bbbbbb'}} src={hubLogoUrl} alt="Hub Logo"  />
      );
      var authorText = '';
      if(this.props.story.author){
        authorText = this.props.story.author + ' - ';
      }

      var hubUrl = urlUtil.getHubUrl(this.props.story.hub_id, config.host, config.port);
      linkUrl = hubUrl;
      author = (
          <div style={{height: '40px', marginBottom: '10px'}}>
            <div className="valign-wrapper" style={{width: '36px', float: 'left'}}>
              <a className="valign" style={{marginTop: '4px'}} href={linkUrl + '/stories'}>{userImage}</a>
            </div>
            <div style={{marginLeft: '46px'}}>
              <p  style={{fontSize: '14px', margin: 0, lineHeight: '1.4rem'}} className="truncate">{authorText} <a className="valign" style={{marginTop: 0, marginBottom: 0, marginLeft: '5px', fontSize: '14px', lineHeight: '1.4rem'}} href={linkUrl + '/stories'}>{this.props.story.hub_name}</a></p>
              <p style={{fontSize: '14px', margin: 0, lineHeight: '1.4rem'}}>
                <IntlProvider locale={this.state.locale}>
                  <FormattedRelative value={updatedTime}/>
                </IntlProvider>
              </p>
            </div>
          </div>
      );
    }



   return (
     <div>
       {author}
     </div>
   );
  }

});

module.exports = StoryHeader;
