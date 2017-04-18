import React from 'react';
import PropTypes from 'prop-types';
var $ = require('jquery');
var urlUtil = require('../../services/url-util');
var UserMenu = require('../UserMenu');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');
var LocaleChooser = require('../LocaleChooser');

var NotificationActions = require('../../actions/NotificationActions');
var ConfirmationActions = require('../../actions/ConfirmationActions');
var MessageActions = require('../../actions/MessageActions');
var HubActions = require('../../actions/HubActions');


var HubHav = React.createClass({

  mixins:[StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    hubid: PropTypes.string.isRequired,
    canEdit: PropTypes.bool
  },

  getDefaultProps() {
    return {
      canEdit: false
    };
  },

  componentDidMount() {
    $(this.refs.hubNav).sideNav({edge: 'right'});
  },

    deleteHub(){
    var _this = this;
    ConfirmationActions.showConfirmation({
      title: this.__('Confirm Hub Deletion'),
      message: this.__('Please confirm that you want to delete this hub and all of its stories.'),
      onPositiveResponse(){
        HubActions.deleteHub(_this.state._csrf, function(err){
          if(err){
            MessageActions.showMessage({title: _this.__('Error'), message: err});
          }else{
            NotificationActions.showNotification({
              message: _this.__('Hub Deleted'),
              dismissAfter: 7000,
              onDismiss(){
                window.location = '/hubs';
              }
            });
          }
        });
      }
    });
  },


  render(){
    var omhBaseUrl = urlUtil.getBaseUrl();

    var hubBaseUrl = omhBaseUrl + '/hub/' + this.props.hubid + '/';

    var deleteButton = '';
    if(this.props.canEdit){
      deleteButton = (
        <li className="nav-link-wrapper"><a href="#" onClick={this.deleteHub}>{this.__('Delete Hub')}</a></li>
      );
    }
    return (
        <nav className="white" style={{height: '0px'}}>
          <div className="nav-wrapper">
            <a href="#" ref="hubNav" data-activates="nav" className="button-collapse white-text text-shadow"
              style={{display: 'block', position: 'absolute', top: '5px', right: '5px'}}>
              <i className="material-icons">menu</i>
            </a>
            <ul className="side-nav" id="nav">
              <UserMenu id="user-menu-sidenav" sideNav/>
              <li className="nav-link-wrapper"><a href={hubBaseUrl}>{this.__('Home')}</a></li>
              <li className="nav-link-wrapper"><a href={hubBaseUrl + 'stories'}>{this.__('Stories')}</a></li>
              <li className="nav-link-wrapper"><a href={hubBaseUrl + 'resources'}>{this.__('Resources')}</a></li>
              <LocaleChooser />
              <hr />
              <li className="nav-link-wrapper"><a href={omhBaseUrl}>{this.__('Back to ') + MAPHUBS_CONFIG.productName}</a></li>
              {deleteButton}
            </ul>
          </div>
        </nav>
    );
  }
});

module.exports = HubHav;
