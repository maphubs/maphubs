var React = require('react');
var HubNav = require('../components/Hub/HubNav');
var HubBanner = require('../components/Hub/HubBanner');
var StoryEditor = require('../components/Story/StoryEditor');
var Notification = require('../components/Notification');
var Message = require('../components/message');
var Confirmation = require('../components/confirmation');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var HubStore = require('../stores/HubStore');
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');

var EditHubStory = React.createClass({

  mixins:[StateMixin.connect(HubStore, {initWithProps: ['hub']}),StateMixin.connect(LocaleStore, {initWithProps: ['locale']})],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    story: React.PropTypes.object.isRequired,
    hub: React.PropTypes.object.isRequired,
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
        <HubNav hubid={this.props.hub.hub_id}/>
        <main>
          <div className="row no-margin">
            <HubBanner editing={false} subPage={true}/>
          </div>
          <div className="row no-margin">
            <StoryEditor story={this.props.story} storyType="hub" hubid={this.props.hub.hub_id}/>
          </div>
        </main>
        <Notification />
        <Message />
        <Confirmation />
      </div>
    );
  }
});

module.exports = EditHubStory;
