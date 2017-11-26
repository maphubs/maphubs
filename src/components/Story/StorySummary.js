//@flow
import React from 'react';
import slugify from 'slugify';
var urlUtil = require('../../services/url-util');
import StoryHeader from './StoryHeader';
import MapHubsComponent from '../../components/MapHubsComponent';
import ShareButtons from '../../components/ShareButtons';

type Props = {|
  story: Object,
  baseUrl: string
|}

export default class StorySummary extends MapHubsComponent<Props, void> {

  props: Props

  static defaultProps = {
    baseUrl: ''
  }

  render(){
    var title = '';
    if(this.props.story.title){
      title = this.props.story.title.replace('&nbsp;', '');
    }
    var linkUrl = '';
    var baseUrl = urlUtil.getBaseUrl();
    if(this.props.story.display_name){
      linkUrl = baseUrl + '/user/' + this.props.story.display_name;
    }else if(this.props.story.hub_id){
      var hubUrl = baseUrl + '/hub/' + this.props.story.hub_id;
      linkUrl = hubUrl;
    }

    linkUrl += '/story/' + this.props.story.story_id + '/' + slugify(title);

    var image = '';
    if(this.props.story.firstimage){
        var imageUrl = this.props.story.firstimage.replace(/\/image\//i, '/thumbnail/');
        imageUrl = '/img/resize/1200?url=' + imageUrl;
      image = (
        <div>
          <a href={linkUrl}>
          <div style={{height: '160px', width: '100%', backgroundImage: 'url('+imageUrl +')', backgroundSize: 'cover', backgroundPosition: 'center'}} />
          </a>
        </div>
      );
    }

    var draft = '';
    if(!this.props.story.published){
      draft = (
         <p style={{position: 'absolute', top: '15px', left: '50%', right: '50%'}}>
          <b style={{color: 'red', textTransform: 'uppercase'}}>{this.__('Draft')}</b>
        </p>
      );
    }

   return (
     <div>
       <StoryHeader story={this.props.story} baseUrl={this.props.baseUrl} />

       {image}
       <a href={linkUrl}>
         <h5 className="grey-text text-darken-4 story-title">{title}</h5>
       </a>

       <div className="story-content">
         <p className="fade">
           {this.props.story.firstline}
         </p>
       </div>
       <a href={linkUrl} style={{fontSize: '12px', color:'rgba(0, 0, 0, 0.45)'}}>
         {this.__('Read more...')}
       </a>
       {draft}
      <ShareButtons 
            title={this.props.story.title} 
            style={{width: '70px', position: 'absolute', right: '10px', bottom: '10px'}} 
         />
     </div>
   );
  }
}