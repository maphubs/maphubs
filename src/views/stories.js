//@flow
import React from 'react';
import Header from '../components/header';
import Footer from '../components/footer';
import StorySummary from '../components/Story/StorySummary';
import MessageActions from '../actions/MessageActions';
import UserStore from '../stores/UserStore';
import MapHubsComponent from '../components/MapHubsComponent';
import Reflux from '../components/Rehydrate';
import LocaleStore from '../stores/LocaleStore';

import type {UserStoreState} from '../stores/UserStore';

type Props = {|
  popularStories: Array<Object>,
  recentStories: Array<Object>,
  locale: string,
  _csrf: string,
  footerConfig: Object,
  headerConfig: Object
|}

type State = UserStoreState;

export default class Stories extends MapHubsComponent<void, Props, State> {

  props: Props

  constructor(props: Props){
		super(props);
    this.stores.push(UserStore);
     Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf});
	}

  onCreateStory = () => {
    if(this.state.user && this.state.user.display_name){
      window.location= '/user/' + this.state.user.display_name + '/stories';
    }else{
      MessageActions.showMessage({title: 'Login Required', message: this.__('Please login to your account or register for an account.')});
    }
  }

	render() {
    var recent = '';
    if(this.props.recentStories && this.props.recentStories.length > 0){
      recent = (
        <div className="col s12 m12 l6">
          <h4>{this.__('Recent Stories')}</h4>
            {this.props.recentStories.map((story) => {
              return (
                <div className="card" key={story.story_id} style={{maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto'}}>
                  <div className="card-content">
                  <StorySummary story={story} />
                  </div>
                </div>
              );
            })}
        </div>
      );
    }

		return (
      <div>
        <Header activePage="stories" {...this.props.headerConfig}/>
        <main>
        <div>

          <div className="row">
            {recent}
            <div className="col s12 m12 l6">
              <h4>{this.__('Popular Stories')}</h4>
              {this.props.popularStories.map((story) => {
                return (
                  <div className="card" key={story.story_id} style={{maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto'}}>
                    <div className="card-content">
                    <StorySummary story={story} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="fixed-action-btn action-button-bottom-right tooltipped" data-position="top" data-delay="50" data-tooltip={this.__('Create New Story')}>
          <a onClick={this.onCreateStory} className="btn-floating btn-large red red-text">
            <i className="large material-icons">add</i>
          </a>
        </div>
        </main>
        <Footer {...this.props.footerConfig}/>
			</div>
		);
	}
}