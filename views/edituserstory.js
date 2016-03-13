var React = require('react');
var Header = require('../components/header');
var StoryEditor = require('../components/Story/StoryEditor');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');


var EditUserStory = React.createClass({

  mixins:[StateMixin.connect(LocaleStore, {initWithProps: ['locale']})],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    story: React.PropTypes.object.isRequired,
    locale: React.PropTypes.string.isRequired
  },

  getDefaultProps() {
    return {
      story: {}
    };
  },


  render() {
    return (
      <div>
        <Header />
        <main>
          <StoryEditor story={this.props.story} storyType="user"/>
        </main>

      </div>
    );
  }
});

module.exports = EditUserStory;
