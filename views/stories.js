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
    stories: React.PropTypes.array,
    locale: React.PropTypes.string.isRequired
  },

	render() {
		return (
      <div>
        <Header activePage="stories"/>
        <main>
        <div className="container">
          <h4>{this.__('Recent Stories')}</h4>
            {this.props.stories.map(function (story) {
              return (
                <div className="card" key={story.story_id}>
                  <div className="card-content">
                  <StorySummary story={story} />
                  </div>
                </div>
              );
            })}

        </div>
        </main>
        <Footer />
			</div>
		);
	}
});

module.exports = Stories;
