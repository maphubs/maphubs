//@flow
import React from 'react';
import Header from '../components/header';
import StoryEditor from '../components/Story/StoryEditor';
import MapHubsComponent from '../components/MapHubsComponent';
import Rehydrate from 'reflux-rehydrate';
import LocaleStore from '../stores/LocaleStore';
import LocaleActions from '../actions/LocaleActions';

export default class EditUserStory extends MapHubsComponent {

  propTypes: {
    story: Object,
    myMaps: Array<Object>,
    popularMaps: Array<Object>,
    username: string,
    locale: string
  }

  static defaultProps: {
    story: {}
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