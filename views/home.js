var React = require('react');
var Header = require('../components/header');
var Footer = require('../components/footer');
var SearchBox = require('../components/SearchBox');
var CardCarousel = require('../components/CardCarousel/CardCarousel');

var config = require('../clientconfig');
var urlUtil = require('../services/url-util');
var slug = require('slug');
var _shuffle = require('lodash.shuffle');
var OnboardingLinks = require('../components/Home/OnboardingLinks');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');

var Home = React.createClass({

  mixins:[StateMixin.connect(LocaleStore, {initWithProps: ['locale']})],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    featuredLayers: React.PropTypes.array,
    featuredGroups: React.PropTypes.array,
    featuredHubs: React.PropTypes.array,
    featuredMaps: React.PropTypes.array,
    featuredStories: React.PropTypes.array,
    popularLayers: React.PropTypes.array,
    popularGroups: React.PropTypes.array,
    popularHubs: React.PropTypes.array,
    popularMaps: React.PropTypes.array,
    popularStories: React.PropTypes.array,
    recentLayers: React.PropTypes.array,
    recentGroups: React.PropTypes.array,
    recentHubs: React.PropTypes.array,
    recentMaps: React.PropTypes.array,
    recentStories: React.PropTypes.array,
    locale: React.PropTypes.string.isRequired
  },

  handleSearch(input){
    window.location = '/search?q=' + input;
  },

  getLayerCard(layer){
    var image_url = '/api/screenshot/layer/thumbnail/' + layer.layer_id + '.png';
    return {
      id: layer.layer_id,
      title: layer.name,
      description: layer.description,
      image_url,
      source: layer.source,
      group: layer.owned_by_group_id,
      type: 'layer',
      link: '/layer/info/' + layer.layer_id + '/' + slug(layer.name)
    };
  },

  getGroupCard(group){
    var image_url = null;
    if(group.hasimage){
      image_url = '/group/' + group.group_id + '/image';
    }
    return {
      id: group.group_id,
      title: group.name,
      description: group.description,
      image_url,
      link: '/group/' + group.group_id,
      group: group.group_id,
      type: 'group'
    };
  },

  getHubCard(hub){
    var hubUrl = urlUtil.getHubUrl(hub.hub_id, config.host, config.port);
    return {
      id: hub.hub_id,
      title: hub.name,
      description: hub.description,
      image_url: '/hub/' + hub.hub_id + '/images/logo',
      background_image_url: '/hub/' + hub.hub_id + '/images/banner',
      link: hubUrl,
      type: 'hub'
    };
  },

  getMapCard(map){
    var image_url = '/api/screenshot/map/thumbnail/' + map.map_id + '.png';
    return {
      id: map.map_id,
      title: map.title ? map.title : '',
      image_url,
      link: '/user/' + map.username + '/map/' + map.map_id,
      type: 'map',
      map
    };
  },

  getStoryCard(story){
    var title = story.title.replace('&nbsp;', '');
    var story_url = '';
    if(story.display_name){
      var baseUrl = urlUtil.getBaseUrl(config.host, config.port);
      story_url = baseUrl + '/user/' + story.display_name;
    }else if(story.hub_id){
      var hubUrl = urlUtil.getHubUrl(story.hub_id, config.host, config.port);
      story_url = hubUrl;
    }
    story_url += '/story/' + story.story_id + '/' + slug(title);

    var image_url = null;
    if(story.firstimage){
      image_url = '/images/story/' + story.story_id + '/firstimage';
    }

    return {
      id: story.story_id,
      title,
      image_url,
      link: story_url,
      type: 'story',
      story
    };
  },

  getCardSet(layers, groups, hubs, maps, stories){
    return _shuffle(layers.map(this.getLayerCard)
      .concat(groups.map(this.getGroupCard))
      .concat(hubs.map(this.getHubCard))
      .concat(maps.map(this.getMapCard))
      .concat(stories.map(this.getStoryCard))
    );
  },

	render() {
    var featuredCards = this.getCardSet(
      this.props.featuredLayers,
      this.props.featuredGroups,
      this.props.featuredHubs,
      this.props.featuredMaps,
      this.props.featuredStories);

    var popularCards = this.getCardSet(
      this.props.popularLayers,
      this.props.popularGroups,
      this.props.popularHubs,
      this.props.popularMaps,
      this.props.popularStories);

    var recentCards = this.getCardSet(
      this.props.recentLayers,
      this.props.recentGroups,
      this.props.recentHubs,
      this.props.recentMaps,
      this.props.recentStories);

		return (
      <div>
      <Header />
      <main style={{margin: 0}}>
        <div className="row" style={{marginTop: '10px', marginBottom: 0, marginRight: '5px'}}>
        <div className="col l3 m4 s12 offset-l9 offset-m8">
          <SearchBox label={this.__('Search MapHubs')} onSearch={this.handleSearch} onReset={this.onResetSearch}/>
        </div>
      </div>
        <OnboardingLinks />
         <div className="divider"></div>
         <div className="row no-margin" style={{height: '400px'}}>
           <div className="row">
             <div className="col s12">
               <h5>{this.__('Featured Content')}</h5>
               <CardCarousel cards={featuredCards} infinite={false}/>
             </div>
           </div>
          </div>
          <div className="divider"></div>
          <div className="row no-margin" style={{height: '400px'}}>
            <div className="row">
              <div className="col s12">
                <h5>{this.__('Popular Content')}</h5>
                <CardCarousel cards={popularCards} infinite={false}/>
              </div>
            </div>
           </div>
           <div className="divider"></div>
           <div className="row no-margin" style={{height: '400px'}}>
             <div className="row">
               <div className="col s12">
                 <h5>{this.__('Recent Content')}</h5>
                 <CardCarousel cards={recentCards} infinite={false}/>
               </div>
             </div>
            </div>
       </main>
       <Footer />
			</div>
		);
	}
});

module.exports = Home;
