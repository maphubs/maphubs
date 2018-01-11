//@flow
import React from 'react';
import HubNav from '../components/Hub/HubNav';
import HubBanner from '../components/Hub/HubBanner';
import StoryEditor from '../components/Story/StoryEditor';
import Notification from '../components/Notification';
import Message from '../components/message';
import Confirmation from '../components/confirmation';
import HubStore from '../stores/HubStore';
import HubActions from '../actions/HubActions';
import MapHubsComponent from '../components/MapHubsComponent';
import Reflux from '../components/Rehydrate';
import LocaleStore from '../stores/LocaleStore';
import ErrorBoundary from '../components/ErrorBoundary';

type Props = {
  story_id: number,
  hub: Object,
  myMaps: Array<Object>,
  popularMaps: Array<Object>,
  locale: string,
  _csrf: string
}

import type {HubStoreState} from '../stores/HubStore';

type State = HubStoreState;

export default class CreateHubStory extends MapHubsComponent<Props, State> {

  props: Props

  static defaultProps = {
    hub: {}
  }

  constructor(props: Props){
		super(props);
    this.stores.push(HubStore);
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf});
    Reflux.rehydrate(HubStore, {hub: this.props.hub});
    HubActions.loadHub(this.props.hub);
	}

  render() {
    return (
      <ErrorBoundary>
        <HubNav hubid={this.props.hub.hub_id}/>
        <main>
          <div className="row no-margin">
            <HubBanner editing={false} subPage={true} hubid={this.props.hub.hub_id}/>
          </div>
          <div className="row no-margin">
            <StoryEditor storyType="hub"
              story={{story_id: this.props.story_id, published: false}}
              myMaps={this.props.myMaps}
              popularMaps={this.props.popularMaps}
              hub_id={this.props.hub.hub_id}/>
          </div>
          <Notification />
          <Message />
          <Confirmation />
        </main>
      </ErrorBoundary>
    );
  }
}