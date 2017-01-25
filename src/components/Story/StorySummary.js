var React = require('react');
var slug = require('slug');

var urlUtil = require('../../services/url-util');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');

var StoryHeader = require('./StoryHeader');


var StorySummary = React.createClass({

  mixins:[StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    story: React.PropTypes.object.isRequired,
    baseUrl: React.PropTypes.string
  },

  getDefaultProps(){
    return {
      baseUrl: ''
    };
  },

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

    linkUrl += '/story/' + this.props.story.story_id + '/' + slug(title);



    var image = '';
    if(this.props.story.firstimage){
        var imageUrl = this.props.story.firstimage.replace(/\/image\//i, '/thumbnail/');
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
       <div className="addthis_sharing_toolbox right"  data-url={linkUrl} data-title={this.props.story.title}></div>
     </div>
   );
  }

});

module.exports = StorySummary;
