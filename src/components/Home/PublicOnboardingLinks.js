//@flow
import React from 'react';
import MapHubsPureComponent from '../MapHubsPureComponent';

type Props = {
  demo: boolean
}

export default class PublicOnboardingLinks extends MapHubsPureComponent<void, Props, void> {

  props:  Props

  render(){
    var mapDemoText = '', storyDemoText = '', hubDemoText = '', searchDemoText = '';
    if(this.props.demo){
      mapDemoText = (
        <div className="flow-text center-align">Interactive maps you’ve made</div>
      );
      storyDemoText = (
        <div className="flow-text center-align">Use your interactive maps with images and text to make stories or blog posts</div>
      );
      hubDemoText = (
        <div className="flow-text center-align">Create mini project sites with your maps and stories</div>
      );
      searchDemoText = (
        <div className="flow-text center-align">Search your content by keyword</div>
      );
    }
    return (
      <div className="row no-margin">
          <div className="col s12 m3 l3 home-onboarding-icon-wrapper" style={{margin: 'auto'}}>
            <a href="/maps" style={{margin: 'auto'}}>
              <div className="valign-wrapper" style={{height: '125px', position: 'relative', margin: 'auto'}}>
                <i className="material-icons valign center-align" style={{fontSize: '80px', margin: 'auto'}}>map</i>
              </div>
              <h5 className="center-align">{this.__('Maps')}</h5>
            </a>
          {mapDemoText}
          </div>
          <div className="col s12 m3 l3 home-onboarding-icon-wrapper" style={{margin: 'auto'}}>
            <a href="/stories" style={{margin: 'auto'}}>
              <div className="valign-wrapper" style={{height: '125px', position: 'relative', margin: 'auto'}}>
                  <i className="material-icons valign center-align" style={{fontSize: '80px', margin: 'auto'}}>library_books</i>
              </div>
              <h5 className="center-align">{this.__('Stories')}</h5>
            </a>
          {storyDemoText}
          </div>
          <div className="col s12 m3 l3 home-onboarding-icon-wrapper" style={{margin: 'auto'}}>
            <a href="/hubs" style={{margin: 'auto'}}>
              <div className="valign-wrapper" style={{height: '125px', position: 'relative', margin: 'auto'}}>
                <i className="material-icons valign center-align" style={{fontSize: '80px', margin: 'auto'}}>web</i>
              </div>
              <h5 className="center-align">{this.__('Hubs')}</h5>
            </a>
            {hubDemoText}
          </div>
          <div className="col s12 m3 l3 home-onboarding-icon-wrapper" style={{margin: 'auto'}}>
            <a href="/search" style={{margin: 'auto'}}>
              <div className="valign-wrapper" style={{height: '125px', position: 'relative', margin: 'auto'}}>
                <i className="material-icons valign center-align" style={{fontSize: '80px', margin: 'auto'}}>search</i>
              </div>
              <h5 className="center-align">{this.__('Search')}</h5>
            </a>
            {searchDemoText}
          </div>
        </div>
    );
  }
}