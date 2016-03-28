var React = require('react');

var Header = require('../components/header');
var Footer = require('../components/footer');
var SearchBox = require('../components/SearchBox');
var CardCarousel = require('../components/CardCarousel/CardCarousel');
var slug = require('slug');
var debug = require('../services/debug')('views/layers');
var config = require('../clientconfig');
var urlUtil = require('../services/url-util');
var request = require('superagent');
var checkClientError = require('../services/client-error-response').checkClientError;
var MessageActions = require('../actions/MessageActions');
var NotificationActions = require('../actions/NotificationActions');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');

var Layers = React.createClass({

  mixins:[StateMixin.connect(LocaleStore, {initWithProps: ['locale']})],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    featuredLayers: React.PropTypes.array,
    recentLayers: React.PropTypes.array,
    popularLayers: React.PropTypes.array,
    locale: React.PropTypes.string.isRequired
  },

  getDefaultProps() {
    return {
      layers: []
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
    request.get(urlUtil.getBaseUrl(config.host, config.port) + '/api/layers/search?q=' + input)
    .type('json').accept('json')
    .end(function(err, res){
      checkClientError(res, err, function(err){
        if(err){
          MessageActions.showMessage({title: 'Error', message: err});
        }else{
          if(res.body.layers && res.body.layers.length > 0){
            _this.setState({searchActive: true, searchResults: res.body.layers});
            NotificationActions.showNotification({message: res.body.layers.length + ' ' + _this.__('Results'), position: 'bottomleft'});
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

    var featuredCards = [];
    var recentCards = [];
    var popularCards = [];

    this.props.featuredLayers.map(function(layer){
      var image_url = '/api/screenshot/layer/thumbnail/' + layer.layer_id + '.jpg';

      featuredCards.push({
        id: layer.layer_id,
        title: layer.name,
        description: layer.description,
        image_url,
        source: layer.source,
        group: layer.owned_by_group_id,
        type: 'layer',
        link: '/layer/info/' + layer.layer_id + '/' + slug(layer.name)
      });
    });

    this.props.recentLayers.map(function(layer){
      var image_url = '/api/screenshot/layer/thumbnail/' + layer.layer_id + '.jpg';

      recentCards.push({
        id: layer.layer_id,
        title: layer.name,
        description: layer.description,
        image_url,
        source: layer.source,
        group: layer.owned_by_group_id,
        type: 'layer',
        link: '/layer/info/' + layer.layer_id + '/' + slug(layer.name)
      });
    });

    this.props.popularLayers.map(function(layer){
      var image_url = '/api/screenshot/layer/thumbnail/' + layer.layer_id + '.jpg';

      popularCards.push({
        id: layer.layer_id,
        title: layer.name,
        description: layer.description,
        image_url,
        source: layer.source,
        group: layer.owned_by_group_id,
        type: 'layer',
        link: '/layer/info/' + layer.layer_id + '/' + slug(layer.name)
      });
    });

    var searchResults = '';
    var searchCards = [];
    if(this.state.searchActive){
      if(this.state.searchResults.length > 0){


        this.state.searchResults.map(function(layer){
          var image_url = '/api/screenshot/layer/thumbnail/' + layer.layer_id + '.jpg';
          searchCards.push({
            id: layer.layer_id,
            title: layer.name,
            description: layer.description,
            image_url,
            source: layer.source,
            group: layer.owned_by_group_id,
            type: 'layer',
            link: '/layer/info/' + layer.layer_id + '/' + slug(layer.name)
          });
        });
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


		return (
      <div>
        <Header activePage="layers" />
        <main>
          <div style={{marginTop: '20px', marginBottom: '10px'}}>
            <div className="row" style={{marginBottom: '0px'}}>
              <div className="col l8 m7 s12">
                <p style={{fontSize: '16px', margin: 0}}>{this.__('MapHubs is a repository of open map layers. Browse layers or create a new layer.')}</p>
              </div>
              <div className="col l3 m4 s12 right" style={{paddingRight: '15px'}}>
                <SearchBox label={this.__('Search Layers')} suggestionUrl="/api/layers/search/suggestions" onSearch={this.handleSearch} onReset={this.resetSearch}/>
              </div>
            </div>
          </div>
          {searchResults}
          <div className="row">
            <div className="col s12">
              <h5>{this.__('Featured')}</h5>
              <div className="divider"></div>
              <CardCarousel cards={featuredCards} infinite={false}/>
            </div>
          </div>
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

          <div className="fixed-action-btn action-button-bottom-right tooltipped" data-position="top" data-delay="50" data-tooltip={this.__('Create New Layer')}>
            <a href="/createlayer" className="btn-floating btn-large red">
              <i className="large material-icons">add</i>
            </a>
          </div>
        </main>
        <Footer />
      </div>
		);
	}
});
module.exports = Layers;
