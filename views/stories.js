var React = require('react');

var Header = require('../components/header');
var Footer = require('../components/footer');
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
    recentStories: React.PropTypes.array,
    featuredStories:  React.PropTypes.array,
    locale: React.PropTypes.string.isRequired
  },

	render() {
    var featured = '';
    if(this.props.featuredStories && this.props.featuredStories.length > 0){
      featured = (
        <div className="row">
          <h4>{this.__('Featured Stories')}</h4>
            {this.props.featuredStories.map(function (story) {
              return (
                <div className="card" key={story.story_id}>
                  <div className="card-content">
                  <StorySummary story={story} />
                  </div>
                </div>
              );
            })}
        </div>
      );
    }

		return (
      <div>
        <Header activePage="stories"/>
        <main>
        <div className="container">
          {featured}
          <div className="row">
            <h4>{this.__('Recent Stories')}</h4>
              {this.props.recentStories.map(function (story) {
                return (
                  <div className="card" key={story.story_id}>
                    <div className="card-content">
                    <StorySummary story={story} />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
        </main>
        <Footer />
			</div>
		);
	}
});

module.exports = Stories;
