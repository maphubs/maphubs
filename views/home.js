var React = require('react');
var Header = require('../components/header');
var Footer = require('../components/footer');
var CardCarousel = require('../components/CardCarousel/CardCarousel');

var Carousel = require('nuka-carousel');
import SliderDecorators from '../components/Home/SliderDecorators';

var OnboardingLinks = require('../components/Home/OnboardingLinks');
var MapHubsProLinks = require('../components/Home/MapHubsProLinks');
var config = require('../clientconfig');
var urlUtil = require('../services/url-util');
var slug = require('slug');
var _shuffle = require('lodash.shuffle');

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
    trendingLayers: React.PropTypes.array,
    trendingGroups: React.PropTypes.array,
    trendingHubs: React.PropTypes.array,
    trendingMaps: React.PropTypes.array,
    trendingStories: React.PropTypes.array,
    locale: React.PropTypes.string.isRequired
  },

  getInitialState(){
    return {
      trendingStoryCards: _shuffle(this.props.trendingStories.map(this.getStoryCard)),
      trendingMapCards: _shuffle(this.props.trendingMaps.map(this.getMapCard)),
      trendingHubCards: _shuffle(this.props.trendingHubs.map(this.getHubCard)),
      trendingGroupCards: _shuffle(this.props.trendingGroups.map(this.getGroupCard)),
      trendingLayerCards: _shuffle(this.props.trendingLayers.map(this.getLayerCard))
    };
  },

  handleSearch(input){
    window.location = '/search?q=' + input;
  },

  getLayerCard(layer){
    var image_url = '/api/screenshot/layer/thumbnail/' + layer.layer_id + '.jpg';
    return {
      id: layer.layer_id.toString(),
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
    var title = hub.name.replace('&nbsp;', '');
    var hubUrl = urlUtil.getHubUrl(hub.hub_id, config.host, config.port);
    return {
      id: hub.hub_id,
      title,
      description: hub.description,
      image_url: '/hub/' + hub.hub_id + '/images/logo',
      background_image_url: '/hub/' + hub.hub_id + '/images/banner/thumbnail',
      link: hubUrl,
      type: 'hub'
    };
  },

  getMapCard(map){
    var image_url = '/api/screenshot/map/thumbnail/' + map.map_id + '.jpg';
    return {
      id: map.map_id.toString(),
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
      image_url = story.firstimage.replace(/\/image\//i, '/thumbnail/');
    }

    return {
      id: story.story_id.toString(),
      title,
      image_url,
      link: story_url,
      type: 'story',
      story
    };
  },

  getMixedCardSet(layers, groups, hubs, maps, stories){
    return layers
      .concat(groups)
      .concat(hubs)
      .concat(maps)
      .concat(stories);
  },

	render() {
    var trendingCards = this.getMixedCardSet(
      this.state.trendingLayerCards,
      this.state.trendingGroupCards,
      this.state.trendingHubCards,
      this.state.trendingMapCards,
      this.state.trendingStoryCards
    );

     var slides = [
       {
         title: this.__('Mapping for Everyone'),
         text: config.productName + ' ' + this.__('is a home for the world\'s open map data and an easy tool for making maps'),
         buttonText: this.__('Learn More'),
         link: '/about',
         img: '/assets/home/Moabi-Aerial.jpg'
       },
       {
         title: this.__('Maps for Journalists'),
         text: this.__('Tell Your Story with Maps'),
         buttonText: this.__('Learn More'),
         link: '/journalists',
         img: '/assets/home/Moabi-Canoe.jpg'
       },
       {
         title: this.__('Explore Maps'),
         text: config.productName + ' ' + this.__('has map layers for environment, natural resources, and development'),
         buttonText: this.__('Explore Maps'),
         link: '/explore',
         img: '/assets/home/MapHubs-Map.jpg'
       },
       {
         title: config.productName + ' ' + this.__('Services'),
         text: config.productName + ' ' + this.__('currently offers a range of service to help you get mapping'),
         buttonText: this.__('Learn More'),
         link: '/services',
         img: '/assets/home/Moabi-Forest.jpg'
       }
     ];

     var homePageCarousel = '', proLinks = '';
     if(config.mapHubsPro){
       proLinks = (
         <div className="row">
          <MapHubsProLinks />
        </div>
       );
     }else {
       homePageCarousel = (
         <div className="row" style={{marginTop: 0, marginBottom: 0, height: '70%', maxHeight:'600px'}}>
           <Carousel autoplay={true} slidesToShow={1} autoplayInterval={5000} wrapAround={true}
             decorators={SliderDecorators}>
             {slides.map(function(slide, i){
               return (
                 <div key={i} className="homepage-slide responsive-img valign-wrapper"
                   style={{
                     height: '100%',
                     backgroundSize: 'cover',
                     backgroundImage: 'url('+ slide.img + ')'
                   }}>
                   <div className="slide-text">
                     <h2 className="no-margin">{slide.title}</h2>
                     <h3 className="no-margin">{slide.text}</h3>
                   </div>
                   <div className="slide-button center">
                     <a className="btn waves-effect z-depth-3" style={{backgroundColor: '#29ABE2', color: 'white', borderRadius: '25px'}} href={slide.link}>{slide.buttonText}</a>
                   </div>
                </div>
              );
             })}
           </Carousel>
         </div>
       );
     }

		return (
      <div style={{margin: 0, height: '100%'}}>
      <Header />
      <main style={{margin: 0, height: '100%'}}>
        {homePageCarousel}

         <div className="row">
          <OnboardingLinks />
        </div>
        {proLinks}
        <div className="divider" />
         <div className="row" style={{marginBottom: '50px'}}>
           <div className="row no-margin" style={{height: '50px'}}>
             <div>
                <h5 className="no-margin center-align" style={{lineHeight: '50px', color: '#212121'}}>
                  {this.__('Trending')}
                  <i className="material-icons" style={{fontWeight: 'bold', color: '#29ABE2', fontSize:'40px', verticalAlign: '-25%', marginLeft: '5px'}}>trending_up</i>
                </h5>
             </div>
           </div>
           <div className="row">
             <div className="col s12">
               <CardCarousel cards={trendingCards} infinite={false}/>
             </div>
           </div>
          </div>
          <Footer />
       </main>

			</div>
		);
	}
});

module.exports = Home;
