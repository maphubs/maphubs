var React = require('react');

var Header = require('../components/header');
var StorySummary = require('../components/Story/StorySummary');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');

var Stories = React.createClass({

  mixins:[StateMixin.connect(LocaleStore, {initWithProps: ['locale']})],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    stories: React.PropTypes.array,
    locale: React.PropTypes.string.isRequired
  },

	render() {
		return (
      <div>
        <Header activePage="stories"/>
        <div className="container">

            {this.props.stories.map(function (story) {
              return (
                <div key={story.story_id}>
                  <StorySummary story={story} />
                  <hr />
                </div>
              );
            })}

        </div>
			</div>
		);
	}
});

module.exports = Stories;
