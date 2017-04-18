import React from 'react';
import PropTypes from 'prop-types';
var Header = require('../components/header');
var StoryEditor = require('../components/Story/StoryEditor');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');

var CreateUserStory = React.createClass({

  mixins:[StateMixin.connect(LocaleStore, {initWithProps: ['locale', '_csrf']})],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    story_id: PropTypes.number.isRequired,
    username: PropTypes.string.isRequired,
    myMaps: PropTypes.array,
    popularMaps: PropTypes.array,
    locale: PropTypes.string.isRequired
  },

  render() {
    return (
      <div>
        <Header />
        <main>
          <StoryEditor storyType="user"
            story={{story_id: this.props.story_id, published: false}}
            myMaps={this.props.myMaps}
            popularMaps={this.props.popularMaps}
            username={this.props.username}/>
        </main>

      </div>
    );
  }
});

module.exports = CreateUserStory;
