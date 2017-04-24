//@flow
import React from 'react';
import Header from '../components/header';
import Footer from '../components/footer';
import StorySummary from '../components/Story/StorySummary';
import MapHubsComponent from '../components/MapHubsComponent';
import Reflux from '../components/Rehydrate';
import LocaleStore from '../stores/LocaleStore';

export default class UserStories extends MapHubsComponent {

  props: {
		stories: Array<Object>,
    myStories: boolean,
    username: string,
    locale: string,
    _csrf: string,
    footerConfig: Object
  }

  static defaultProps = {
    stories: [],
    myStories: false
  }

  constructor(props: Object) {
    super(props);
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf});
  }

	render() {
    var _this = this;

    var button = '';
    if(this.props.myStories){
      button=(
        <div>
          <div className="fixed-action-btn action-button-bottom-right tooltipped" data-position="top" data-delay="50" data-tooltip={this.__('Create New Story')}>
            <a href="/user/createstory" className="btn-floating btn-large red red-text">
              <i className="large material-icons">add</i>
            </a>
          </div>
        </div>
      );
    }

    var emptyMessage = '';
    if(!this.props.stories || this.props.stories.length === 0){
      emptyMessage = (
        <div className="row" style={{height: 'calc(100% - 100px)'}}>
          <div className="valign-wrapper" style={{height: '100%'}}>
            <div className="valign align-center center-align" style={{width: '100%'}}>
              <h5>{this.__('Click the button below to create your first story')}</h5>
            </div>
          </div>
        </div>
      );
    }

		return (
      <div>
        <Header activePage="mystories"/>
        <main style={{minHeight: 'calc(100% - 70px)'}}>
        <div className="container" style={{height: '100%'}}>
           {emptyMessage}
            {this.props.stories.map((story) => {
              return (
                <div className="card" key={story.story_id} style={{maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto'}}>
                  <div className="card-content">
                  <StorySummary baseUrl={'/user/' + _this.props.username}  story={story} />
                  </div>
                </div>
              );
            })}

        </div>
        {button}
      </main>
      <Footer {...this.props.footerConfig} />
			</div>
		);
	}
}