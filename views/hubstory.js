var React = require('react');
var HubNav = require('../components/Hub/HubNav');
var HubBanner = require('../components/Hub/HubBanner');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var HubStore = require('../stores/HubStore');

var StoryHeader = require('../components/Story/StoryHeader');

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
    var title = story.title.replace('&nbsp;', '');
    var button = '';
    var baseUrl = '';
    if(MAPHUBS_CONFIG.mapHubsPro){
      baseUrl = '/hub/' + this.props.hub.hub_id;
    }
    if(this.props.canEdit){
      button = (
        <div className="fixed-action-btn action-button-bottom-right">
          <a className="btn-floating btn-large red red-text tooltipped"
            href={baseUrl + '/story/' + this.props.story.story_id + '/edit/' + slug(title)}
            data-delay="50" data-position="left" data-tooltip={this.__('Edit')}>
            <i className="large material-icons">mode_edit</i>
          </a>

        </div>
      );
    }

    var discuss = '', addthis = '';
    if(!MAPHUBS_CONFIG.mapHubsPro){
      addthis = (
        <div className="addthis_sharing_toolbox right"></div>
      );
      discuss = (
        <div className="row">

          <ReactDisqusThread
                shortname="maphubs"
                identifier={'maphubs-story-' + story.story_id}
                title={title}
                />
        </div>
      );
    }

    /*eslint-disable react/no-danger*/
    return (
      <div>
      <HubNav hubid={this.props.hub.hub_id}/>
      <main>
        <div className="row">
          <HubBanner hubid={this.props.hub.hub_id} subPage/>
        </div>
        <div className="container">
          <div className="row" style={{marginTop: '20px'}}>
            <div className="col s12 m19 l9">
              <StoryHeader story={story} />
            </div>
            <div className="col s12 m3 l3">
              {addthis}
            </div>
          </div>
          <div className="row">
            <h3 className="story-title">{title}</h3>
            <div className="story-content" dangerouslySetInnerHTML={{__html: story.body}}></div>
          </div>
          <hr />
          {discuss}
        </div>
        {button}
        </main>
      </div>
    );
      /*eslint-enable react/no-danger*/
  }
});

module.exports = HubStory;
