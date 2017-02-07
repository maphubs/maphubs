// @flow
var React = require('react');
var Header = require('../components/header');
var Footer = require('../components/footer');
var CardCarousel = require('../components/CardCarousel/CardCarousel');
var StorySummary = require('../components/Story/StorySummary');

var PublicOnboardingLinks = require('../components/Home/PublicOnboardingLinks');
var HomePageMap = require('../components/Home/HomePageMap');
var _shuffle = require('lodash.shuffle');
var cardUtil = require('../services/card-util');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');

/**
 * Example of a customized home page configuration
 */
var HomeDemo = React.createClass({

  mixins:[StateMixin.connect(LocaleStore, {initWithProps: ['locale', '_csrf']})],

  __(text: string){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    trendingLayers: React.PropTypes.array.isRequired,
    trendingGroups: React.PropTypes.array.isRequired,
    trendingHubs: React.PropTypes.array.isRequired,
    trendingMaps: React.PropTypes.array.isRequired,
    trendingStories: React.PropTypes.array.isRequired,
    featuredStories:  React.PropTypes.array.isRequired,
    locale: React.PropTypes.string.isRequired,
    mapHub: React.PropTypes.object,
    mapHubLayers: React.PropTypes.array
  },

  getInitialState(): Object{
    return {
      trendingStoryCards: _shuffle(this.props.trendingStories.map(cardUtil.getStoryCard)),
      trendingMapCards: _shuffle(this.props.trendingMaps.map(cardUtil.getMapCard)),
      trendingHubCards: _shuffle(this.props.trendingHubs.map(cardUtil.getHubCard)),
      trendingGroupCards: _shuffle(this.props.trendingGroups.map(cardUtil.getGroupCard)),
      trendingLayerCards: _shuffle(this.props.trendingLayers.map(cardUtil.getLayerCard))
    };
  },

  handleSearch(input: string){
    window.location = '/search?q=' + input;
  },

	render() {

    var trendingCards = cardUtil.combineCards([this.state.trendingLayerCards,
    this.state.trendingGroupCards,
    this.state.trendingHubCards,
    this.state.trendingMapCards,
    this.state.trendingStoryCards]);

    

     var homepageMap= '';

     if(MAPHUBS_CONFIG.homepageMapHubId && this.props.mapHub){
       homepageMap = (
         <div className="row" style={{height: 'calc(100vh - 150px)'}}>
            <HomePageMap height="100%" hub={this.props.mapHub} layers={this.props.mapHubLayers}/>
            <div className="divider" />
          </div>
       );
     }

     var featured = '';
     if(this.props.featuredStories && this.props.featuredStories.length > 0){
       featured = (
         <div>
           <div className="divider" />
           <div className="row">
             <h5 className="no-margin center-align" style={{lineHeight: '50px', color: '#212121'}}>
               {this.__('Featured Stories')}
             </h5>
               {this.props.featuredStories.map(function (story) {
                 return (
                   <div className="card" key={story.story_id} style={{maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto'}}>
                     <div className="card-content">
                     <StorySummary story={story} />
                     </div>
                   </div>
                 );
               })}
           </div>
         </div>
       );
     }

		return (
      <div style={{margin: 0, height: '100%'}}>
      <Header />
      <main style={{margin: 0, height: '100%'}}>
        {homepageMap}
          <div className="row">
          <div className="flow-text center align-center">
            Welcome to the MapHubs Demo! You can use this section to describe your project or organization.
          </div>
          </div>
         <div className="row">
          <PublicOnboardingLinks />
        </div>
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
            {featured}
          <Footer />
       </main>

			</div>
		);
	}
});

module.exports = HomeDemo;
