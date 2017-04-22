//@flow
import React from 'react';
import HubNav from '../components/Hub/HubNav';
import HubBanner from '../components/Hub/HubBanner';
import StoryEditor from '../components/Story/StoryEditor';
import Notification from '../components/Notification';
import Message from '../components/message';
import Confirmation from '../components/confirmation';
import HubStore from '../stores/HubStore';
import MapHubsComponent from '../components/MapHubsComponent';
import Rehydrate from 'reflux-rehydrate';
import LocaleStore from '../stores/LocaleStore';
import LocaleActions from '../actions/LocaleActions';
import HubActions from '../actions/HubActions';

export default class EditHubStory extends MapHubsComponent {

  props: {
    story: Object,
    hub: Object,
    myMaps: Array<Object>,
    popularMaps: Array<Object>,
    locale: string,
    _csrf: string
  }

  static defaultProps: {
    story: {}
  }

   constructor(props: Object){
		super(props);
    this.stores.push(HubStore);
	}

  componentWillMount() {
    Rehydrate.initStore(LocaleStore);
    Rehydrate.initStore(HubStore);
    LocaleActions.rehydrate({locale: this.props.locale, _csrf: this.props._csrf});
    HubActions.rehydrate({hub: this.props.hub});
  }

  render() {
    return (
      <div>
        <HubNav hubid={this.props.hub.hub_id}/>
        <main>
          <div className="row no-margin">
            <HubBanner editing={false} subPage={true}/>
          </div>
          <div className="row no-margin">
            <StoryEditor story={this.props.story}
              myMaps={this.props.myMaps}
              popularMaps={this.props.popularMaps}
              storyType="hub" hub_id={this.props.hub.hub_id}/>
          </div>
        </main>
        <Notification />
        <Message />
        <Confirmation />
      </div>
    );
  }
}