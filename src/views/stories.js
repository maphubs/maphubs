//@flow
import React from 'react';
import Header from '../components/header';
import Footer from '../components/footer';
import StorySummary from '../components/Story/StorySummary';
import MessageActions from '../actions/MessageActions';
import UserStore from '../stores/UserStore';
import MapHubsComponent from '../components/MapHubsComponent';
import LocaleActions from '../actions/LocaleActions';
import Rehydrate from 'reflux-rehydrate';
import LocaleStore from '../stores/LocaleStore';

export default class Stories extends MapHubsComponent {

  props: {
    popularStories: Array<Object>,
    featuredStories: Array<Object>,
    locale: string,
    footerConfig: Object
  }

  constructor(props: Object){
		super(props);
    this.stores.push(UserStore);
	}

  componentWillMount() {
    Rehydrate.initStore(LocaleStore);   
    LocaleActions.rehydrate({locale: this.props.locale, _csrf: this.props._csrf});
  }

  onCreateStory(){
    if(this.state.user.display_name){
      window.location= '/user/' + this.state.user.display_name + '/stories';
    }else{
      MessageActions.showMessage({title: 'Login Required', message: this.__('Please login to your account or register for an account.')});
    }
  }

	render() {
    var featured = '';
    if(this.props.featuredStories && this.props.featuredStories.length > 0){
      featured = (
        <div className="col s12 m12 l6">
          <h4>{this.__('Featured Stories')}</h4>
            {this.props.featuredStories.map(function (story) {
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
        <Header activePage="stories"/>
        <main>
        <div>

          <div className="row">
            {featured}
            <div className="col s12 m12 l6">
              <h4>{this.__('Popular Stories')}</h4>
              {this.props.popularStories.map(function (story) {
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
          <a onClick={this.onCreateStory.bind(this)} className="btn-floating btn-large red red-text">
            <i className="large material-icons">add</i>
          </a>
        </div>
        </main>
        <Footer {...this.props.footerConfig}/>
			</div>
		);
	}
}