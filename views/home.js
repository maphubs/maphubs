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
var CardFilter = require('../components/Home/CardFilter');

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

  getInitialState(){
    return {
      storyMode: 'featured',
      mapMode: 'featured',
      hubMode: 'featured',
      groupMode: 'featured',
      layerMode: 'featured',

      featuredStoryCards: _shuffle(this.props.featuredStories.map(this.getStoryCard)),
      popularStoryCards: _shuffle(this.props.popularStories.map(this.getStoryCard)),
      recentStoryCards: _shuffle(this.props.recentStories.map(this.getStoryCard)),

      featuredMapCards: _shuffle(this.props.featuredMaps.map(this.getMapCard)),
      popularMapCards: _shuffle(this.props.popularMaps.map(this.getMapCard)),
      recentMapCards: _shuffle(this.props.recentMaps.map(this.getMapCard)),

      featuredHubCards: _shuffle(this.props.featuredHubs.map(this.getHubCard)),
      popularHubCards: _shuffle(this.props.popularHubs.map(this.getHubCard)),
      recentHubCards: _shuffle(this.props.recentHubs.map(this.getHubCard)),

      featuredGroupCards: _shuffle(this.props.featuredGroups.map(this.getGroupCard)),
      popularGroupCards: _shuffle(this.props.popularGroups.map(this.getGroupCard)),
      recentGroupCards: _shuffle(this.props.recentGroups.map(this.getGroupCard)),

      featuredLayerCards: _shuffle(this.props.featuredLayers.map(this.getLayerCard)),
      popularLayerCards: _shuffle(this.props.featuredLayers.map(this.getLayerCard)),
      recentLayerCards: _shuffle(this.props.featuredLayers.map(this.getLayerCard))
    };
  },

  handleSearch(input){
    window.location = '/search?q=' + input;
  },

  getLayerCard(layer){
    var image_url = '/api/screenshot/layer/thumbnail/' + layer.layer_id + '.jpg';
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
    var image_url = '/api/screenshot/map/thumbnail/' + map.map_id + '.jpg';
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

  getMixedCardSet(layers, groups, hubs, maps, stories){
    return _shuffle(layers.map(this.getLayerCard)
      .concat(groups.map(this.getGroupCard))
      .concat(hubs.map(this.getHubCard))
      .concat(maps.map(this.getMapCard))
      .concat(stories.map(this.getStoryCard))
    );
  },

	render() {
    var _this = this;
    var storyCards = [];
    if(this.state.storyMode === 'featured'){
      storyCards = this.state.featuredStoryCards;
    }else if(this.state.storyMode === 'popular'){
      storyCards = this.state.popularStoryCards;
    }else if(this.state.storyMode === 'recent'){
      storyCards = this.state.recentStoryCards;
    }

    var mapCards = [];
    if(this.state.mapMode === 'featured'){
      mapCards =  this.state.featuredMapCards;
    }else if(this.state.mapMode === 'popular'){
      mapCards =  this.state.popularMapCards;
    }else if(this.state.mapMode === 'recent'){
      mapCards =  this.state.recentMapCards;
    }

    var hubCards = [];
    if(this.state.hubMode === 'featured'){
      hubCards =  this.state.featuredHubCards;
    }else if(this.state.hubMode === 'popular'){
      hubCards =  this.state.popularHubCards;
    }else if(this.state.hubMode === 'recent'){
      hubCards =  this.state.recentHubCards;
    }

    var groupCards = [];
    if(this.state.groupMode === 'featured'){
      groupCards = this.state.featuredGroupCards;
    }else if(this.state.groupMode === 'popular'){
      groupCards =  this.state.popularGroupCards;
    }else if(this.state.groupMode === 'recent'){
      groupCards =  this.state.recentGroupCards;
    }

    var layerCards = [];
    if(this.state.layerMode === 'featured'){
      layerCards =  this.state.featuredLayerCards;
    }else if(this.state.layerMode === 'popular'){
      layerCards =  this.state.popularLayerCards;
    }else if(this.state.layerMode === 'recent'){
      layerCards =  this.state.recentLayerCards;
    }



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
         <div className="row no-margin">
           <div className="row no-margin" style={{height: '50px'}}>
             <div className="col s12 m2 l1">
               <a href="/stories">
                 <h5 className="home-section no-margin" style={{lineHeight: '50px'}}>{this.__('Stories')}</h5>
               </a>
             </div>
             <div className="col s12 m6 l7 valign-wrapper" style={{height: '50px'}}>
               <span className="valign" style={{fontSize: '14px'}}>{this.__('User generated stories featuring interactive maps and images on a variety of topics')}</span>
             </div>
             <div className="col s12 m4 l4 valign-wrapper" style={{height: '100%'}}>
              <CardFilter onChange={function(value){_this.setState({storyMode:value});}} />
             </div>
           </div>
           <div className="row">
             <div className="col s12">
               <CardCarousel cards={storyCards} infinite={false}/>
             </div>
           </div>
           <div className="row center-align" style={{marginTop: '35px', marginBottom:'10px'}}>
             <a href='/stories' className="btn">{this.__('More Stories')}</a>
           </div>
          </div>
          <div className="divider"></div>
          <div className="row no-margin">
            <div className="row no-margin" style={{height: '50px'}}>
              <div className="col s12 m2 l1">
                <a href="/maps">
                  <h5 className="home-section no-margin" style={{lineHeight: '50px'}}>{this.__('Maps')}</h5>
                </a>
              </div>
              <div className="col s12 m6 l7 valign-wrapper" style={{height: '50px'}}>
                <span className="valign" style={{fontSize: '14px'}}>{this.__('Interactive maps featuring open data')}</span>
              </div>
              <div className="col s12 m4 l4 valign-wrapper" style={{height: '100%'}}>
               <CardFilter onChange={function(value){_this.setState({mapMode:value});}} />
              </div>
            </div>
            <div className="row">
              <div className="col s12">
                <CardCarousel cards={mapCards} infinite={false}/>
              </div>
            </div>
            <div className="row center-align" style={{marginTop: '35px', marginBottom:'10px'}}>
              <a href='/maps' className="btn">{this.__('More Maps')}</a>
            </div>
           </div>
           <div className="divider"></div>
           <div className="row no-margin">
             <div className="row no-margin" style={{height: '50px'}}>
               <div className="col s12 m2 l1">
                 <a href="/hubs">
                   <h5 className="home-section no-margin" style={{lineHeight: '50px'}}>{this.__('Hubs')}</h5>
                 </a>
               </div>
               <div className="col s12 m6 l7 valign-wrapper" style={{height: '50px'}}>
                 <span className="valign" style={{fontSize: '14px'}}>{this.__('Collections of stories and maps on a variety of topics')}</span>
               </div>
               <div className="col s12 m4 l4 valign-wrapper" style={{height: '100%'}}>
                <CardFilter onChange={function(value){_this.setState({hubMode:value});}} />
               </div>
             </div>
             <div className="row">
               <div className="col s12">
                 <CardCarousel cards={hubCards} infinite={false}/>
               </div>
             </div>
             <div className="row center-align" style={{marginTop: '35px', marginBottom:'10px'}}>
               <a href='/hubs' className="btn">{this.__('More Hubs')}</a>
             </div>
            </div>
            <div className="divider"></div>
            <div className="row no-margin">
              <div className="row no-margin" style={{height: '50px'}}>
                <div className="col s12 m2 l1">
                  <a href="/groups">
                    <h5 className="home-section no-margin" style={{lineHeight: '50px'}}>{this.__('Groups')}</h5>
                  </a>
                </div>
                <div className="col s12 m6 l7 valign-wrapper" style={{height: '50px'}}>
                  <span className="valign" style={{fontSize: '14px'}}>{this.__('Collections of layers managed by a group or oranization')}</span>
                </div>
                <div className="col s12 m4 l4 valign-wrapper" style={{height: '100%'}}>
                 <CardFilter onChange={function(value){_this.setState({groupMode:value});}} />
                </div>
              </div>
              <div className="row">
                <div className="col s12">
                  <CardCarousel cards={groupCards} infinite={false}/>
                </div>
              </div>
              <div className="row center-align" style={{marginTop: '35px', marginBottom:'10px'}}>
                <a href='/groups' className="btn">{this.__('More Groups')}</a>
              </div>
             </div>
             <div className="divider"></div>
             <div className="row no-margin">
               <div className="row no-margin" style={{height: '50px'}}>
                 <div className="col s12 m2 l1">
                   <a href="/layers">
                     <h5 className="home-section no-margin" style={{lineHeight: '50px'}}>{this.__('Layers')}</h5>
                   </a>
                 </div>
                 <div className="col s12 m6 l7 valign-wrapper" style={{height: '50px'}}>
                   <span className="valign" style={{fontSize: '14px'}}>{this.__('Open map data layers')}</span>
                 </div>
                 <div className="col s12 m4 l4 valign-wrapper" style={{height: '100%'}}>
                  <CardFilter onChange={function(value){_this.setState({layerMode:value});}} />
                 </div>
               </div>
               <div className="row">
                 <div className="col s12">
                   <CardCarousel cards={layerCards} infinite={false}/>
                 </div>
               </div>
               <div className="row center-align" style={{marginTop: '35px', marginBottom:'10px'}}>
                 <a href='/layers' className="btn">{this.__('More Layers')}</a>
               </div>
              </div>
       </main>
       <Footer />
			</div>
		);
	}
});

module.exports = Home;
