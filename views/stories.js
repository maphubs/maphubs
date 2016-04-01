var React = require('react');

var Header = require('../components/header');
var Footer = require('../components/footer');
var StorySummary = require('../components/Story/StorySummary');
var MessageActions = require('../actions/MessageActions');
var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');
var UserStore = require('../stores/UserStore');

var Stories = React.createClass({

  mixins:[StateMixin.connect(UserStore), StateMixin.connect(LocaleStore, {initWithProps: ['locale']})],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    popularStories: React.PropTypes.array,
    featuredStories:  React.PropTypes.array,
    locale: React.PropTypes.string.isRequired
  },

  onCreateStory(){
    if(this.state.user.display_name){
      window.location= '/user/' + this.state.user.display_name + '/stories';
    }else{
      MessageActions.showMessage({title: 'Login Required', message: this.__('Please login to your account or register for an account.')});
    }
  },

	render() {
    var featured = '';
    if(this.props.featuredStories && this.props.featuredStories.length > 0){
      featured = (
        <div className="col s12 m12 l6">
          <h4>{this.__('Featured Stories')}</h4>
            {this.props.featuredStories.map(function (story) {
              return (
                <div className="card" key={story.story_id} style={{maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto'}}>
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
        <div>

          <div className="row">
            {featured}
            <div className="col s12 m12 l6">
              <h4>{this.__('Popular Stories')}</h4>
              {this.props.popularStories.map(function (story) {
                return (
                  <div className="card" key={story.story_id} style={{maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto'}}>
                    <div className="card-content">
                    <StorySummary story={story} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="fixed-action-btn action-button-bottom-right tooltipped" data-position="top" data-delay="50" data-tooltip={this.__('Create New Story')}>
          <a onClick={this.onCreateStory} className="btn-floating btn-large red">
            <i className="large material-icons">add</i>
          </a>
        </div>
        </main>
        <Footer />
			</div>
		);
	}
});

module.exports = Stories;
