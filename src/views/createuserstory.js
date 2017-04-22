//@flow
import React from 'react';
import Header from '../components/header';
import StoryEditor from '../components/Story/StoryEditor';

import MapHubsComponent from '../components/MapHubsComponent';
import Rehydrate from 'reflux-rehydrate';
import LocaleStore from '../stores/LocaleStore';
import LocaleActions from '../actions/LocaleActions';

export default class CreateUserStory extends MapHubsComponent {

  props: {
    story_id: number,
    username: string,
    myMaps: Array<Object>,
    popularMaps: Array<Object>,
    locale: string,
    _csrf: string
  }

  componentWillMount() {
    Rehydrate.initStore(LocaleStore);
    LocaleActions.rehydrate({locale: this.props.locale, _csrf: this.props._csrf});
  }

  render() {
    return (
      <div>
        <Header />
        <main>
          <StoryEditor storyType="user"
            story={{story_id: this.props.story_id, published: false}}
            myMaps={this.props.myMaps}
            popularMaps={this.props.popularMaps}
            username={this.props.username}/>
        </main>

      </div>
    );
  }
}