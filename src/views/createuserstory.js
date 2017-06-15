//@flow
import React from 'react';
import Header from '../components/header';
import StoryEditor from '../components/Story/StoryEditor';
import MapHubsComponent from '../components/MapHubsComponent';
import Reflux from '../components/Rehydrate';
import LocaleStore from '../stores/LocaleStore';

type Props = {
  story_id: number,
  username: string,
  myMaps: Array<Object>,
  popularMaps: Array<Object>,
  locale: string,
  _csrf: string,
  headerConfig: Object
}

export default class CreateUserStory extends MapHubsComponent<void, Props, void> {

  props: Props

  constructor(props: Props) {
    super(props);
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf});
  }

  render() {
    return (
      <div>
        <Header {...this.props.headerConfig} />
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