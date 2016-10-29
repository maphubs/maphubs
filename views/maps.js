var React = require('react');

var Header = require('../components/header');
var Footer = require('../components/footer');
var SearchBox = require('../components/SearchBox');
var CardCarousel = require('../components/CardCarousel/CardCarousel');
var cardUtil = require('../services/card-util');
var debug = require('../services/debug')('views/maps');
var urlUtil = require('../services/url-util');
var request = require('superagent');
var checkClientError = require('../services/client-error-response').checkClientError;
var MessageActions = require('../actions/MessageActions');
var NotificationActions = require('../actions/NotificationActions');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');

var Maps = React.createClass({

  mixins:[StateMixin.connect(LocaleStore, {initWithProps: ['locale']})],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    featuredMaps: React.PropTypes.array,
    recentMaps: React.PropTypes.array,
    popularMaps: React.PropTypes.array,
    locale: React.PropTypes.string.isRequired
  },

  getDefaultProps() {
    return {
    };
  },

  getInitialState(){
    return {
      searchResults: [],
      searchActive: false
    };
  },

  handleSearch(input) {
    var _this = this;
    debug('searching for: ' + input);
    request.get(urlUtil.getBaseUrl() + '/api/maps/search?q=' + input)
    .type('json').accept('json')
    .end(function(err, res){
      checkClientError(res, err, function(err){
        if(err){
          MessageActions.showMessage({title: 'Error', message: err});
        }else{
          if(res.body.maps && res.body.maps.length > 0){
            _this.setState({searchActive: true, searchResults: res.body.maps});
            NotificationActions.showNotification({message: res.body.maps.length + ' ' + _this.__('Results'), position: 'bottomleft'});
          }else{
            //show error message
            NotificationActions.showNotification({message: _this.__('No Results Found'), dismissAfter: 5000, position: 'bottomleft'});
          }
        }
      },
      function(cb){
        cb();
      }
      );
    });
  },

  resetSearch(){
    this.setState({searchActive: false, searchResults: []});
  },

	render() {

    var featuredCards = this.props.featuredMaps.map(cardUtil.getMapCard);
    var recentCards = this.props.recentMaps.map(cardUtil.getMapCard);
    var popularCards = this.props.popularMaps.map(cardUtil.getMapCard);


    var searchResults = '';
    if(this.state.searchActive){
      if(this.state.searchResults.length > 0){

        var searchCards =   this.state.searchResults.map(cardUtil.getMapCard);

        searchResults = (
          <div className="row">
            <div className="col s12">
            <h5>{this.__('Search Results')}</h5>
            <div className="divider"></div>
            <CardCarousel infinite={false} cards={searchCards}/>
          </div>
          </div>
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
    if(!MAPHUBS_CONFIG.mapHubsPro && featuredCards && featuredCards.length > 0){
      featured = (
        <div className="row">
          <div className="col s12">
            <h5>{this.__('Featured')}</h5>
            <div className="divider"></div>
            <CardCarousel cards={featuredCards} infinite={false}/>
          </div>
        </div>
      );
    }

		return (
      <div>
        <Header activePage="maps" />
        <main>
          <div style={{marginTop: '20px', marginBottom: '10px'}}>
            <div className="row" style={{marginBottom: '0px'}}>
              <div className="col l8 m7 s12">
                <p style={{fontSize: '16px', margin: 0}}>{this.__('Browse maps or create a new map using the respository of open map layers.')}</p>
              </div>
              <div className="col l3 m4 s12 right" style={{paddingRight: '15px'}}>
                <SearchBox label={this.__('Search Maps')} suggestionUrl="/api/maps/search/suggestions" onSearch={this.handleSearch} onReset={this.resetSearch}/>
              </div>
            </div>
          </div>
          {searchResults}
          {featured}
          <div className="row">
            <div className="col s12">
              <h5>{this.__('Popular')}</h5>
              <div className="divider"></div>
              <CardCarousel cards={popularCards} infinite={false}/>
            </div>
          </div>
          <div className="row">
            <div className="col s12">
              <h5>{this.__('Recent')}</h5>
              <div className="divider"></div>
              <CardCarousel cards={recentCards} infinite={false}/>
            </div>
          </div>

          <div>
            <div className="fixed-action-btn action-button-bottom-right tooltipped" data-position="top" data-delay="50" data-tooltip={this.__('Create New Map')}>
              <a href="/map/new" className="btn-floating btn-large red red-text">
                <i className="large material-icons">add</i>
              </a>
            </div>
          </div>
        </main>
        <Footer />
      </div>
		);
	}
});
module.exports = Maps;
