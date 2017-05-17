// @flow
import React from 'react';
import Header from '../components/header';
import Footer from '../components/footer';
import CardCarousel from '../components/CardCarousel/CardCarousel';
import StorySummary from '../components/Story/StorySummary';
import PublicOnboardingLinks from '../components/Home/PublicOnboardingLinks';
import InteractiveMap from '../components/InteractiveMap';
import _shuffle from 'lodash.shuffle';
import cardUtil from '../services/card-util';
import MapHubsComponent from '../components/MapHubsComponent';
import Reflux from '../components/Rehydrate';
import LocaleStore from '../stores/LocaleStore';

import type {Layer} from '../stores/layer-store';
import type {Group} from '../stores/GroupStore';

type Props = {
    trendingLayers: Array<Layer>,
    trendingGroups:Array<Group>,
    trendingHubs: Array<Object>,
    trendingMaps: Array<Object>,
    trendingStories: Array<Object>,
    featuredStories:  Array<Object>,
    locale: string,
    _csrf: string,
    map: Object,
    pageConfig: Object,
    layers: Array<Layer>,
    footerConfig: Object,
    headerConfig: Object,
    mapConfig: Object
  }

  type State = {
    collectionStoryCards: Array<Object>,
    collectionMapCards: Array<Object>,
    collectionHubCards: Array<Object>,
    collectionGroupCards: Array<Object>,
    collectionLayerCards: Array<Object>
  }


/**
 * Example of a customized home page configuration
 */
export default class HomePro extends MapHubsComponent<void, Props, State> {

  props: Props

  static defaultProps = {
    trendingStories: [],
    trendingMaps: [],
    trendingHubs: [],
    trendingGroups: [],
    trendingLayers: []
  }

  constructor(props: Object) {
    super(props);
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf});
    this.state = {
      collectionStoryCards: _shuffle(this.props.trendingStories.map(cardUtil.getStoryCard)),
      collectionMapCards: _shuffle(this.props.trendingMaps.map(cardUtil.getMapCard)),
      collectionHubCards: _shuffle(this.props.trendingHubs.map(cardUtil.getHubCard)),
      collectionGroupCards: _shuffle(this.props.trendingGroups.map(cardUtil.getGroupCard)),
      collectionLayerCards: _shuffle(this.props.trendingLayers.map(cardUtil.getLayerCard))
    };
  }

  handleSearch = (input: string) => {
    window.location = '/search?q=' + input;
  }

  renderHomePageMap = (config: Object, key: string) => {
    var homepageMap= '';
    if(this.props.map){
      homepageMap = (
         <div key={key} className="row">
            <InteractiveMap height="calc(100vh - 150px)" 
             {...this.props.map}
             mapConfig={this.props.mapConfig}    
             layers={this.props.layers} showTitle={false}
             {...this.props.map.settings}
             />
            <div className="divider" />
          </div>
       );
    }
    return homepageMap;   
  }

  renderLinks = (config: Object, key: string) => {
    var links = '';
    var bgColor = config.bgColor ? config.bgColor : 'inherit';
    links = (
      <div key={key} className="row" style={{backgroundColor: bgColor}}>
        <PublicOnboardingLinks />
      </div>
    );
    return links;
  }

  renderCarousel = (config: Object, key: string) => {
    var collectionCards = cardUtil.combineCards([this.state.collectionLayerCards,
    this.state.collectionGroupCards,
    this.state.collectionHubCards,
    this.state.collectionMapCards,
    this.state.collectionStoryCards]);

     var bgColor = config.bgColor ? config.bgColor : 'inherit';

     var trendingIcon = '';
     if(config.trendingIcon){
       trendingIcon = (
        <i className="material-icons" style={{fontWeight: 'bold', color: MAPHUBS_CONFIG.primaryColor, fontSize:'40px', verticalAlign: '-25%', marginLeft: '5px'}}>trending_up</i>
                
       );
     }

     var title = config.title ? this._o_(config.title) : this.__('Trending');
     

    return (
      <div key={key} className="row" style={{marginBottom: '50px', backgroundColor: bgColor}}>
           <div className="row no-margin" style={{height: '50px'}}>
             <div>
                <h5 className="no-margin center-align" style={{lineHeight: '50px'}}>
                  {title}
                  {trendingIcon}
                </h5>
             </div>
           </div>
           <div className="row">
             <div className="col s12">
               <CardCarousel cards={collectionCards} infinite={false}/>
             </div>
           </div>
        </div>
    );
  }

  renderStories = (key: string) => {
    var featured = '';
     if(this.props.featuredStories && this.props.featuredStories.length > 0){
       featured = (
         <div key={key}>
           <div className="divider" />
           <div className="row">
             <h5 className="no-margin center-align" style={{lineHeight: '50px', color: '#212121'}}>
               {this.__('Featured Stories')}
             </h5>
               {this.props.featuredStories.map(story => {
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
     return featured;
  }

  renderText = (config: Object, key: string) => {
    var text = config.text[this.state.locale];
    if(!text) text = config.text.en;
    return (
      <div key={key} className="row">
        <div className="flow-text center align-center">
          {text}
        </div>
      </div>
    );
  }

	render() {

    var _this = this;

		return (
      <div style={{margin: 0, height: '100%'}}>
      <Header {...this.props.headerConfig}/>
      <main style={{margin: 0, height: '100%'}}>

       {this.props.pageConfig.components.map((component, i) => {
         var key = `homepro-component-${i}`;
          if(component.type === 'map'){
            return _this.renderHomePageMap(component, key);
          }else if(component.type === 'carousel'){
            return _this.renderCarousel(component, key);
          }else if(component.type === 'storyfeed'){
            return _this.renderStories(key);
          }else if(component.type === 'text'){
            return _this.renderText(component, key);
          }else if(component.type === 'links'){
            return _this.renderLinks(component, key);
          }else{
            return '';
          }
          
        })
       }
        <Footer {...this.props.footerConfig}/>
       </main>
			</div>
		);
	}
}
