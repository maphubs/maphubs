var React = require('react');
var HubNav = require('../components/Hub/HubNav');
var HubBanner = require('../components/Hub/HubBanner');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var HubStore = require('../stores/HubStore');

var ReactDisqusThread = require('react-disqus-thread');
var slug = require('slug');

var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');

var HubStory = React.createClass({

  mixins:[StateMixin.connect(HubStore, {initWithProps: ['hub']}), StateMixin.connect(LocaleStore, {initWithProps: ['locale']})],
  propTypes: {
    story: React.PropTypes.object.isRequired,
    hub: React.PropTypes.object.isRequired,
    canEdit: React.PropTypes.bool,
    locale: React.PropTypes.string.isRequired
  },

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  getDefaultProps() {
    return {
      story: {},
      hub: {},
      canEdit: false
    };
  },

  getInitialState() {
    return {};
  },

  render() {
    var story = this.props.story;

    var button = '';
    if(this.props.canEdit){
      button = (
        <div className="fixed-action-btn action-button-bottom-right">
          <a className="btn-floating btn-large red tooltipped"
            href={'/story/' + this.props.story.story_id + '/edit/' + slug(this.props.story.title)}
            data-delay="50" data-position="left" data-tooltip={this.__('Edit')}>
            <i className="large material-icons">mode_edit</i>
          </a>

        </div>
      );
    }
    /*eslint-disable react/no-danger*/
    return (
      <div>
      <HubNav hubid={this.props.hub.hub_id}/>
      <main>
        <div className="row">
          <HubBanner subPage={true}/>
        </div>
        <div className="container">
          <h3 className="story-title">{story.title}</h3>
          <div className="story-content" dangerouslySetInnerHTML={{__html: story.body}}></div>
          <br />
          <hr />
          <div className="addthis_sharing_toolbox"></div>
          <ReactDisqusThread
                shortname="openmaphub"
                identifier={'maphubs-story-' + story.story_id}
                title={story.title}
                />
        </div>
        {button}
        </main>
      </div>
    );
      /*eslint-enable react/no-danger*/
  }
});

module.exports = HubStory;
