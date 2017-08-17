//@flow
import React from 'react';
import Header from '../components/header';
import Footer from '../components/footer';
import SearchBox from '../components/SearchBox';
import CardCarousel from '../components/CardCarousel/CardCarousel';
import _shuffle from 'lodash.shuffle';
import CardFilter from '../components/Home/CardFilter';
import cardUtil from '../services/card-util';
import SubPageBanner from '../components/Home/SubPageBanner';
import MapHubsComponent from '../components/MapHubsComponent';
import Reflux from '../components/Rehydrate';
import LocaleStore from '../stores/LocaleStore';

type Props = {
  featuredLayers: Array<Object>,
  featuredGroups: Array<Object>,
  featuredHubs: Array<Object>,
  featuredMaps: Array<Object>,
  featuredStories: Array<Object>,
  popularLayers: Array<Object>,
  popularGroups: Array<Object>,
  popularHubs: Array<Object>,
  popularMaps: Array<Object>,
  popularStories: Array<Object>,
  recentLayers: Array<Object>,
  recentGroups: Array<Object>,
  recentHubs: Array<Object>,
  recentMaps: Array<Object>,
  recentStories: Array<Object>,
  locale: string,
  _csrf: string,
  footerConfig: Object,
  headerConfig: Object
}

import type {CardConfig} from '../components/CardCarousel/Card';

type State = {
  storyMode: string,
  mapMode: string,
  hubMode: string,
  groupMode: string,
  layerMode: string,
  featuredStoryCards: Array<CardConfig>,
  popularStoryCards: Array<CardConfig>,
  recentStoryCards: Array<CardConfig>,
  featuredMapCards: Array<CardConfig>,
  popularMapCards: Array<CardConfig>,
  recentMapCards: Array<CardConfig>,
  featuredHubCards: Array<CardConfig>,
  popularHubCards: Array<CardConfig>,
  recentHubCards: Array<CardConfig>,
  featuredGroupCards: Array<CardConfig>,
  popularGroupCards: Array<CardConfig>,
  recentGroupCards: Array<CardConfig>,
  featuredLayerCards: Array<CardConfig>,
  popularLayerCards: Array<CardConfig>,
  recentLayerCards: Array<CardConfig>
}

export default class Home extends MapHubsComponent<Props, State> {

  props: Props

  constructor(props: Props){
		super(props);
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf});
    this.state = {
      storyMode: MAPHUBS_CONFIG.mapHubsPro ? 'popular' : 'featured',
      mapMode: MAPHUBS_CONFIG.mapHubsPro ? 'popular' : 'featured',
      hubMode: MAPHUBS_CONFIG.mapHubsPro ? 'popular' : 'featured',
      groupMode: MAPHUBS_CONFIG.mapHubsPro ? 'popular' : 'featured',
      layerMode: MAPHUBS_CONFIG.mapHubsPro ? 'popular' : 'featured',

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
	}

  handleSearch = (input: string) => {
    window.location = '/search?q=' + input;
  }

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
      <Header activePage="explore" {...this.props.headerConfig}/>
      <main style={{margin: 0}}>
        <SubPageBanner locale={this.props.locale}
          img="https://cdn.maphubs.com/assets/home/Moabi-Canoe.jpg" backgroundPosition="50% 15%"
           title={this.__('Explore')} subTitle={this.__(`
               Browse Stories, Maps, Groups, Hubs, and Layers
              `)} />
            <div className="row" style={{marginTop: '20px', marginBottom: 0, marginRight: '5px'}}>
          <div className="col s12" style={{paddingLeft: '25%', paddingRight: '25%'}}>
            <SearchBox label={this.__('Search') + ' ' + MAPHUBS_CONFIG.productName} onSearch={this.handleSearch}/>
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
       <Footer {...this.props.footerConfig}/>
			</div>
		);
	}
}