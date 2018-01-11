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
import Reflux from '../components/Rehydrate';
import LocaleStore from '../stores/LocaleStore';
import ErrorBoundary from '../components/ErrorBoundary';

type Props = {
  story: Object,
  hub: Object,
  myMaps: Array<Object>,
  popularMaps: Array<Object>,
  locale: string,
  _csrf: string
}

export default class EditHubStory extends MapHubsComponent<Props, void> {

  props: Props

  static defaultProps = {
    story: {}
  }

   constructor(props: Props){
		super(props);
    this.stores.push(HubStore);
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf});
    Reflux.rehydrate(HubStore, {hub: this.props.hub});
	}

  render() {
    return (
      <ErrorBoundary>
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
          <Notification />
          <Message />
          <Confirmation />
        </main>
      </ErrorBoundary>
    );
  }
}