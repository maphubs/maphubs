var React = require('react');
var Header = require('../components/header');
var Footer = require('../components/footer');
var SearchBox = require('../components/SearchBox');
var CardCarousel = require('../components/CardCarousel/CardCarousel');

var config = require('../clientconfig');
var _shuffle = require('lodash.shuffle');
var CardFilter = require('../components/Home/CardFilter');
var cardUtil = require('../services/card-util');

var SubPageBanner = require('../components/Home/SubPageBanner');

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
      storyMode: config.mapHubsPro ? 'popular' : 'featured',
      mapMode: config.mapHubsPro ? 'popular' : 'featured',
      hubMode: config.mapHubsPro ? 'popular' : 'featured',
      groupMode: config.mapHubsPro ? 'popular' : 'featured',
      layerMode: config.mapHubsPro ? 'popular' : 'featured',

      featuredStoryCards: _shuffle(this.props.featuredStories.map(cardUtil.getStoryCard)),
      popularStoryCards: _shuffle(this.props.popularStories.map(cardUtil.getStoryCard)),
      recentStoryCards: _shuffle(this.props.recentStories.map(cardUtil.getStoryCard)),

      featuredMapCards: _shuffle(this.props.featuredMaps.map(cardUtil.getMapCard)),
      popularMapCards: _shuffle(this.props.popularMaps.map(cardUtil.getMapCard)),
      recentMapCards: _shuffle(this.props.recentMaps.map(cardUtil.getMapCard)),

      featuredHubCards: _shuffle(this.props.featuredHubs.map(cardUtil.getHubCard)),
      popularHubCards: _shuffle(this.props.popularHubs.map(cardUtil.getHubCard)),
      recentHubCards: _shuffle(this.props.recentHubs.map(cardUtil.getHubCard)),

      featuredGroupCards: _shuffle(this.props.featuredGroups.map(cardUtil.getGroupCard)),
      popularGroupCards: _shuffle(this.props.popularGroups.map(cardUtil.getGroupCard)),
      recentGroupCards: _shuffle(this.props.recentGroups.map(cardUtil.getGroupCard)),

      featuredLayerCards: _shuffle(this.props.featuredLayers.map(cardUtil.getLayerCard)),
      popularLayerCards: _shuffle(this.props.popularLayers.map(cardUtil.getLayerCard)),
      recentLayerCards: _shuffle(this.props.recentLayers.map(cardUtil.getLayerCard))
    };
  },

  handleSearch(input){
    window.location = '/search?q=' + input;
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
      <Header activePage="explore" />
      <main style={{margin: 0}}>
        <SubPageBanner locale={this.props.locale}
          img="/assets/home/Moabi-Canoe.jpg" backgroundPosition="50% 15%"
           title={this.__('Explore')} subTitle={this.__(`
               Browse Stories, Maps, Groups, Hubs, and Layers
              `)} />
            <div className="row" style={{marginTop: '20px', marginBottom: 0, marginRight: '5px'}}>
          <div className="col s12" style={{paddingLeft: '25%', paddingRight: '25%'}}>
            <SearchBox label={this.__('Search') + ' ' + config.productName} onSearch={this.handleSearch} onReset={this.onResetSearch}/>
          </div>
        </div>
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
              <CardFilter defaultValue={this.state.storyMode} onChange={function(value){_this.setState({storyMode:value});}} />
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
               <CardFilter defaultValue={this.state.mapMode} onChange={function(value){_this.setState({mapMode:value});}} />
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
                <CardFilter defaultValue={this.state.hubMode} onChange={function(value){_this.setState({hubMode:value});}} />
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
                  <span className="valign" style={{fontSize: '14px'}}>{this.__('Collections of layers managed by a group or organization')}</span>
                </div>
                <div className="col s12 m4 l4 valign-wrapper" style={{height: '100%'}}>
                 <CardFilter defaultValue={this.state.groupMode} onChange={function(value){_this.setState({groupMode:value});}} />
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
                  <CardFilter defaultValue={this.state.layerMode} onChange={function(value){_this.setState({layerMode:value});}} />
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
