var React = require('react');

var Header = require('../components/header');
var StorySummary = require('../components/Story/StorySummary');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');

var UserStories = React.createClass({

  mixins:[StateMixin.connect(LocaleStore, {initWithProps: ['locale']})],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
		stories: React.PropTypes.array,
    myStories: React.PropTypes.bool,
    username: React.PropTypes.string.isRequired,
    locale: React.PropTypes.string.isRequired
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
            <a href="/user/createstory" className="btn-floating btn-large red">
              <i className="large material-icons">add</i>
            </a>
          </div>
        </div>
      );
    }

		return (
      <div>
        <Header activePage="mystories"/>
        <div className="container">

            {this.props.stories.map(function (story) {
              return (
                <div key={story.story_id}>
                  <StorySummary baseUrl={'/user/' + _this.props.username}  story={story} />
                  <hr />
                </div>
              );
            })}

        </div>
        {button}
			</div>
		);
	}
});

module.exports = UserStories;
