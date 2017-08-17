//@flow
import React from 'react';
import Header from '../components/header';
import Footer from '../components/footer';
import SearchBox from '../components/SearchBox';
import CardCollection from '../components/CardCarousel/CardCollection';
var debug = require('../services/debug')('views/groups');
import urlUtil from '../services/url-util';
import request from 'superagent';
var checkClientError = require('../services/client-error-response').checkClientError;
import MessageActions from '../actions/MessageActions';
import NotificationActions from '../actions/NotificationActions';
import cardUtil from '../services/card-util';
import MapHubsComponent from '../components/MapHubsComponent';
import Reflux from '../components/Rehydrate';
import LocaleStore from '../stores/LocaleStore';

type Props = {
  featuredGroups: Array<Object>,
  recentGroups: Array<Object>,
  popularGroups: Array<Object>,
  locale: string,
  _csrf: string,
  footerConfig: Object,
  headerConfig: Object
}

type State = {
  searchResults: Array<Object>,
  searchActive: boolean
}

export default class Groups extends MapHubsComponent<Props, State> {

  props: Props

  static defaultProps = {
    groups: []
  }

  state = {
    searchResults: [],
    searchActive: false
  }

  constructor(props: Props) {
    super(props);
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf});
  }

  handleSearch = (input: string) => {
    var _this = this;
    debug.log('searching for: ' + input);
    request.get(urlUtil.getBaseUrl() + '/api/groups/search?q=' + input)
    .type('json').accept('json')
    .end((err, res) => {
      checkClientError(res, err, (err) => {
        if(err){
          MessageActions.showMessage({title: _this.__('Error'), message: err});
        }else{
          if(res.body.groups && res.body.groups.length > 0){
            _this.setState({searchActive: true, searchResults: res.body.groups});
            NotificationActions.showNotification({message: res.body.groups.length + ' ' + _this.__('Results'), position: 'bottomleft'});
          }else{
            //show error message
            NotificationActions.showNotification({message: _this.__('No Results Found'), dismissAfter: 5000, position: 'bottomleft'});
          }
        }
      },
      (cb) => {
        cb();
      }
      );

    });
  }

  resetSearch = () => {
    this.setState({searchActive: false, searchResults: []});
  }

	render() {

    var featuredCards = this.props.featuredGroups.map(cardUtil.getGroupCard);
    var popularCards = this.props.popularGroups.map(cardUtil.getGroupCard);
    var recentCards = this.props.recentGroups.map(cardUtil.getGroupCard);

    var searchResults = '';

    if(this.state.searchActive){
      if(this.state.searchResults.length > 0){

        var searchCards = this.state.searchResults.map(cardUtil.getGroupCard);
        searchResults = (
          <CardCollection title={this.__('Search Results')} cards={searchCards} />
        );
      }
      else {
        searchResults = (
          <div className="row">
            <div className="col s12">
            <h5>{this.__('Search Results')}</h5>
            <div className="divider"></div>
            <p><b>{this.__('No Results Found')}</b></p>
          </div>
          </div>
        );
      }

    }
    var featured = '';
    if(featuredCards.length > 0){
      featured = (
        <CardCollection title={this.__('Featured')} cards={featuredCards} viewAllLink="/groups/all" />
      );
    }

		return (
      <div>
          <Header activePage="groups" {...this.props.headerConfig} />
          <main>
            <div style={{marginTop: '20px', marginBottom: '10px'}}>
              <div className="row" style={{marginBottom: '0px'}}>
                <div className="col l8 m7 s12">
                  <h4 className="no-margin">{this.__('Groups')}</h4>
                  <p style={{fontSize: '16px', margin: 0}}>{this.__('Create a group for your organization or browse the content of existing groups.')}</p>
                </div>
                <div className="col l3 m4 s12 right" style={{paddingRight: '15px'}}>
              <SearchBox label={this.__('Search Groups')} suggestionUrl="/api/groups/search/suggestions" onSearch={this.handleSearch} onReset={this.resetSearch}/>
              </div>
            </div>
            </div>
            <div className="carousel-container">

            {searchResults}

              {featured}
              <CardCollection title={this.__('Popular')} cards={popularCards} viewAllLink="/groups/all" />
              <CardCollection title={this.__('Recent')} cards={recentCards} viewAllLink="/groups/all" />
         
             
              <div className="fixed-action-btn action-button-bottom-right tooltipped" data-position="top" data-delay="50" data-tooltip={this.__('Create New Group')}>
                <a className="btn-floating btn-large red red-text" href="/creategroup">
                  <i className="large material-icons">add</i>
                </a>
              </div>
            </div>
            <div className="row center-align">
              <a className="btn" href="/groups/all">{this.__('View All Groups')}</a>
            </div>
          </main>
          <Footer {...this.props.footerConfig}/>
      </div>
		);
	}
}