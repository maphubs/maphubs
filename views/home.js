var React = require('react');
var ReactDOM = require('react-dom');
var Map = require('../components/Map/Map');
var Legend = require('../components/Map/Legend');
var Header = require('../components/header');
var Footer = require('../components/footer');
var SearchBox = require('../components/SearchBox');
var CardCarousel = require('../components/CardCarousel/CardCarousel');
var request = require('superagent');
var debug = require('../services/debug')('home');
var config = require('../clientconfig');
var urlUtil = require('../services/url-util');
var slug = require('slug');
var $ = require('jquery');
var _shuffle = require('lodash.shuffle');
var OnboardingLinks = require('../components/Home/OnboardingLinks');

var MessageActions = require('../actions/MessageActions');
var NotificationActions = require('../actions/NotificationActions');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');

import Progress from '../components/Progress';

var Home = React.createClass({

  mixins:[StateMixin.connect(LocaleStore, {initWithProps: ['locale']})],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    featuredLayers: React.PropTypes.array,
    featuredGroups: React.PropTypes.array,
    featuredHubs: React.PropTypes.array,
    locale: React.PropTypes.string.isRequired
  },

  getInitialState() {
    return {
      searchResult: null,
      searching: false
    };
  },
  componentDidUpdate(){
    if(this.state.searchResult){
      var scrollTarget = $(ReactDOM.findDOMNode(this.refs.search));
      $('html,body').animate({
         scrollTop: scrollTarget.offset().top
       }, 1000);
    }
  },

  onResetSearch(){
    this.refs.map.resetGeoJSON();
    this.setState({searchResult: null});
  },

  handleSearch(input){
    var _this = this;
    this.setState({searching: true});
    request.get('/api/global/search' + '?q=' + input)
    .type('json').accept('json')
    .end(function(err, res){
      _this.setState({searching: false});
      if (err) {
        debug(err);
        MessageActions.showMessage({title: 'Error', message: err.toString()});
      }else{
        if(res.body && res.body.features && res.body.features.length > 0){
          NotificationActions.showNotification(
            {
              message: res.body.features.length + ' ' + _this.__('Results Found'),
              position: 'bottomright',
              dismissAfter: 3000
          });
          _this.setState({searchResult: res.body});
        }else{
          //clear Map
          //tell user no results found
          NotificationActions.showNotification(
            {
              message: _this.__('No Results Found'),
              position: 'bottomright',
              dismissAfter: 3000
          });
        }
      }
    });
  },

	render() {
    var featuredLayerCards = [];
    var featuredGroupCards = [];
    var featuredHubCards = [];
    var searchCards = [];


    this.props.featuredLayers.map(function(layer){
      var image_url = '/api/screenshot/layer/thumbnail/' + layer.layer_id + '.png';

      featuredLayerCards.push({
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

    this.props.featuredGroups.map(function(group){
      featuredGroupCards.push({
        id: group.group_id,
        title: group.name,
        description: group.description,
        image_url: '/group/' + group.group_id + '/image',
        link: '/group/' + group.group_id,
        group: group.group_id,
        type: 'group'
      });
    });

    this.props.featuredHubs.map(function(hub){
      var hubUrl = urlUtil.getHubUrl(hub.hub_id, config.host, config.port);
      featuredHubCards.push({
        id: hub.hub_id,
        title: hub.name,
        description: hub.description,
        image_url: '/hub/' + hub.hub_id + '/images/logo',
        background_image_url: '/hub/' + hub.hub_id + '/images/banner',
        link: hubUrl,
        type: 'hub'
      });
    });

    var featuredCards = _shuffle(featuredLayerCards.concat(featuredGroupCards).concat(featuredHubCards));

    var cardsPanel = '', mapPanel = '';
    if(this.state.searchResult){
      cardsPanel = (
        <div className="row">
          <div className="col s12">
            <div className="divider"></div>
            <CardCarousel cards={searchCards} infinite={false}/>
          </div>
        </div>
    );

    mapPanel = (
      <div className="row no-margin" style={{height: 'calc(75% - 50px)', minHeight: '200px'}}>
        <Map ref="map" style={{width: '100%', height: '100%'}}
          disableScrollZoom={true}
          data={this.state.searchResult} >
          <Legend style={{
              position: 'absolute',
              bottom: '0px',
              right: '0px',
              zIndex: '1',
              width: '160px'
            }}/>
        </Map>
       </div>
    );

    }else {
      cardsPanel = (
        <div className="row">
          <div className="col s12">
            <h5>{this.__('Featured Content')}</h5>
            <CardCarousel cards={featuredCards} infinite={false}/>
          </div>
        </div>
      );
    }

		return (
      <div>
      <Header />
      <main style={{height: '100%'}}>
        <OnboardingLinks />
         <div className="divider"></div>
        <div ref="search" className="container" style={{marginTop: '50px', marginBottom: '50px'}}>
          <div className="row">
            <h5 className="center-align" style={{color: '#212121'}}>{this.__('Search MapHubs')}</h5>
            </div>
          <div className="row">
            <SearchBox label={this.__('Search All Data')} onSearch={this.handleSearch} onReset={this.onResetSearch}/>
          </div>

        </div>
         {mapPanel}
         <div className="divider"></div>
         <div className="row no-margin" style={{height: 'calc(50% - 50px)', minHeight: '200px'}}>
           {cardsPanel}
          </div>
          <Progress id="searching" title={this.__('Searching')} subTitle="" dismissible={false} show={this.state.searching}/>
       </main>
       <Footer />
			</div>
		);
	}
});

module.exports = Home;
