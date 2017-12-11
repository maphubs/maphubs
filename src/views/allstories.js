//@flow
import React from 'react';
import Header from '../components/header';
import Footer from '../components/footer';
import MessageActions from '../actions/MessageActions';
import UserStore from '../stores/UserStore';
import MapHubsComponent from '../components/MapHubsComponent';
import Reflux from '../components/Rehydrate';
import LocaleStore from '../stores/LocaleStore';
import StoryList from '../components/Lists/StoryList';
import Toggle from '../components/forms/toggle';
import Formsy from 'formsy-react';
import CardGrid from '../components/CardCarousel/CardGrid';
import cardUtil from '../services/card-util';
import type {UserStoreState} from '../stores/UserStore';
import ErrorBoundary from '../components/ErrorBoundary';

type Props = {|
  stories: Array<Object>,
  locale: string,
  _csrf: string,
  footerConfig: Object,
  headerConfig: Object
|}

type State = {
  showList?: boolean
} & UserStoreState;

export default class AllStories extends MapHubsComponent<Props, State> {

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

  onModeChange = (showList: boolean) => {
    this.setState({showList});
  }

	render() {

    let stories = '';
    if(this.state.showList){
      stories = (
        <div className="container">
          <StoryList showTitle={false} stories={this.props.stories} />
        </div>
      );
    }else{
      let cards = this.props.stories.map(cardUtil.getStoryCard);
      stories = (
        <CardGrid cards={cards} />
      );
    }

		return (
      <ErrorBoundary>
        <Header activePage="stories" {...this.props.headerConfig}/>
        <main>
          <div style={{marginTop: '20px', marginBottom: '10px'}}>
            <div className="row" style={{marginBottom: '0px'}}>
                <div className="col l8 m7 s12">
                  <h4 className="no-margin">{this.__('Stories')}</h4>
                </div>
            </div>

          <div className="row">
            <div className="left-align" style={{marginLeft: '15px', marginTop: '25px'}}>
              <Formsy>
                <Toggle name="mode" onChange={this.onModeChange} labelOff={this.__('Grid')} labelOn={this.__('List')} checked={this.state.showList}/>
            </Formsy>
            </div>
            <div className="row">
              {stories}
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
			</ErrorBoundary>
		);
	}
}