//@flow
import React from 'react';
import Header from '../components/header';
import StoryEditor from '../components/Story/StoryEditor';
import MapHubsComponent from '../components/MapHubsComponent';
import Reflux from '../components/Rehydrate';
import LocaleStore from '../stores/LocaleStore';

export default class EditUserStory extends MapHubsComponent {

  props: {
    story: Object,
    myMaps: Array<Object>,
    popularMaps: Array<Object>,
    username: string,
    locale: string,
    _csrf: string,
    headerConfig: Object
  }

  static defaultProps = {
    story: {}
  }

  constructor(props: Object) {
    super(props);
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf});
  }

  render() {
    return (
      <div>
        <Header {...this.props.headerConfig}/>
        <main>
          <StoryEditor
            story={this.props.story}
            myMaps={this.props.myMaps}
            popularMaps={this.props.popularMaps}
            username={this.props.username}
            storyType="user"/>
        </main>

      </div>
    );
  }
}