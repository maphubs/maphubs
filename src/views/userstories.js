import React from 'react';
import PropTypes from 'prop-types';

var Header = require('../components/header');
var Footer = require('../components/footer');
var StorySummary = require('../components/Story/StorySummary');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');

var UserStories = React.createClass({

  mixins:[StateMixin.connect(LocaleStore, {initWithProps: ['locale', '_csrf']})],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
		stories: PropTypes.array,
    myStories: PropTypes.bool,
    username: PropTypes.string.isRequired,
    locale: PropTypes.string.isRequired,
    footerConfig: PropTypes.object
  },

  getDefaultProps() {
    return {
      stories: [],
      myStories: false
    };
  },

	render() {
    var _this = this;

    var button = '';
    if(this.props.myStories){
      button=(
        <div>
          <div className="fixed-action-btn action-button-bottom-right tooltipped" data-position="top" data-delay="50" data-tooltip={this.__('Create New Story')}>
            <a href="/user/createstory" className="btn-floating btn-large red red-text">
              <i className="large material-icons">add</i>
            </a>
          </div>
        </div>
      );
    }

    var emptyMessage = '';
    if(!this.props.stories || this.props.stories.length == 0){
      emptyMessage = (
        <div className="row" style={{height: 'calc(100% - 100px)'}}>
          <div className="valign-wrapper" style={{height: '100%'}}>
            <div className="valign align-center center-align" style={{width: '100%'}}>
              <h5>{this.__('Click the button below to create your first story')}</h5>
            </div>
          </div>
        </div>
      );
    }

		return (
      <div>
        <Header activePage="mystories"/>
        <main style={{minHeight: 'calc(100% - 70px)'}}>
        <div className="container" style={{height: '100%'}}>
           {emptyMessage}
            {this.props.stories.map(function (story) {
              return (
                <div className="card" key={story.story_id} style={{maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto'}}>
                  <div className="card-content">
                  <StorySummary baseUrl={'/user/' + _this.props.username}  story={story} />
                  </div>
                </div>
              );
            })}

        </div>
        {button}
      </main>
      <Footer {...this.props.footerConfig} />
			</div>
		);
	}
});

module.exports = UserStories;
