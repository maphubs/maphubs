var React = require('react');
var Header = require('../components/header');
var Footer = require('../components/footer');
var CardCarousel = require('../components/CardCarousel/CardCarousel');

var Carousel = require('nuka-carousel');
import SliderDecorators from '../components/Home/SliderDecorators';

var OnboardingLinks = require('../components/Home/OnboardingLinks');
var MapHubsProLinks = require('../components/Home/MapHubsProLinks');
var MailingList = require('../components/Home/MailingList');
var _shuffle = require('lodash.shuffle');
var cardUtil = require('../services/card-util');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');

var Home = React.createClass({

  mixins:[StateMixin.connect(LocaleStore, {initWithProps: ['locale', '_csrf']})],

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
      trendingStoryCards: _shuffle(this.props.trendingStories.map(cardUtil.getStoryCard)),
      trendingMapCards: _shuffle(this.props.trendingMaps.map(cardUtil.getMapCard)),
      trendingHubCards: _shuffle(this.props.trendingHubs.map(cardUtil.getHubCard)),
      trendingGroupCards: _shuffle(this.props.trendingGroups.map(cardUtil.getGroupCard)),
      trendingLayerCards: _shuffle(this.props.trendingLayers.map(cardUtil.getLayerCard))
    };
  },

  handleSearch(input){
    window.location = '/search?q=' + input;
  },

	render() {

    var trendingCards = cardUtil.combineCards([this.state.trendingLayerCards,
    this.state.trendingGroupCards,
    this.state.trendingHubCards,
    this.state.trendingMapCards,
    this.state.trendingStoryCards]);


     var slides = [
       {
         title: this.__('MapHubs is now Map for Environment'),
         text: this.__('We have merged MapHubs with Map for Environment'),
         buttonText: this.__('Learn More'),
         link: 'https://mapforenvironment.org/user/map4env/story/61/MapHubs-is-now-Map-for-Environment',
         img: '/assets/home/Moabi–Chameleon.jpg'
       },
       {
         title: this.__('Mapping for Everyone'),
         text: MAPHUBS_CONFIG.productName + ' ' + this.__('is a home for the world\'s open map data and an easy tool for making maps'),
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
         title: this.__('OpenStreetMap'),
         text: this.__('Help us make maps to monitor the world’s natural resources.'),
         buttonText: this.__('Learn More'),
         link: 'https://osm.mapforenvironment.org',
         img: '/assets/home/m4e_osm_banner.jpg'
       },
       {
         title: this.__('Explore Maps'),
         text: MAPHUBS_CONFIG.productName + ' ' + this.__('has map layers for environment, natural resources, and development'),
         buttonText: this.__('Explore Maps'),
         link: '/explore',
         img: '/assets/home/MapHubs-Map.jpg'
       },
       {
         title: MAPHUBS_CONFIG.productName + ' ' + this.__('Services'),
         text: MAPHUBS_CONFIG.productName + ' ' + this.__('currently offers a range of service to help you get mapping'),
         buttonText: this.__('Learn More'),
         link: '/services',
         img: '/assets/home/Moabi-Forest.jpg'
       }
     ];

     var homePageCarousel = '', proLinks = '', mailingList = '';
     if(MAPHUBS_CONFIG.mapHubsPro){
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
                     <a className="btn waves-effect z-depth-3" style={{borderRadius: '25px'}} href={slide.link}>{slide.buttonText}</a>
                   </div>
                </div>
              );
             })}
           </Carousel>

         </div>
       );
      mailingList = (
         <MailingList />
       )
     }

		return (
      <div style={{margin: 0, height: '100%'}}>
      <Header />
      <main style={{margin: 0, height: '100%'}}>
        {homePageCarousel}
        {mailingList}
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
                  <i className="material-icons" style={{fontWeight: 'bold', color: MAPHUBS_CONFIG.primaryColor, fontSize:'40px', verticalAlign: '-25%', marginLeft: '5px'}}>trending_up</i>
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
