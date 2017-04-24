//@flow
import React from 'react';
import HubNav from '../components/Hub/HubNav';
import HubBanner from '../components/Hub/HubBanner';
import HubStore from '../stores/HubStore';
import StoryHeader from '../components/Story/StoryHeader';
import ReactDisqusThread from 'react-disqus-thread';
var slug = require('slug');
import MapHubsComponent from '../components/MapHubsComponent';
import Reflux from '../components/Rehydrate';
import LocaleStore from '../stores/LocaleStore';

export default class HubStory extends MapHubsComponent {

  props: {
    story: Object,
    hub: Object,
    canEdit: boolean,
    locale: string,
    _csrf: string
  }

  static defaultProps = {
    story: {},
    hub: {},
    canEdit: false
  }

  constructor(props: Object){
		super(props);
    this.stores.push(HubStore);
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf});
    Reflux.rehydrate(HubStore, {hub: this.props.hub, canEdit: this.props.canEdit});
	}

  render() {
    var story = this.props.story;
    var title = story.title.replace('&nbsp;', '');
    var button = '';
    var baseUrl = '/hub/' + this.props.hub.hub_id;
    if(this.props.canEdit){
      button = (
        <div className="fixed-action-btn action-button-bottom-right">
          <a className="btn-floating btn-large red red-text tooltipped"
            href={baseUrl + '/story/' + this.props.story.story_id + '/edit/' + slug(title)}
            data-delay="50" data-position="left" data-tooltip={this.__('Edit')}>
            <i className="large material-icons">mode_edit</i>
          </a>

        </div>
      );
    }

    var discuss = '', addthis = '';
    if(!MAPHUBS_CONFIG.mapHubsPro){
      addthis = (
        <div className="addthis_sharing_toolbox right"></div>
      );
      discuss = (
        <div className="row">

          <ReactDisqusThread
                shortname="maphubs"
                identifier={'maphubs-story-' + story.story_id}
                title={title}
                />
        </div>
      );
    }

    /*eslint-disable react/no-danger*/
    return (
      <div>
      <HubNav hubid={this.props.hub.hub_id}/>
      <main>
        <div className="row">
          <HubBanner hubid={this.props.hub.hub_id} subPage/>
        </div>
        <div className="container">
          <div className="row" style={{marginTop: '20px'}}>
            <div className="col s12 m19 l9">
              <StoryHeader story={story} />
            </div>
            <div className="col s12 m3 l3">
              {addthis}
            </div>
          </div>
          <div className="row">
            <h3 className="story-title">{title}</h3>
            <div className="story-content" dangerouslySetInnerHTML={{__html: story.body}}></div>
          </div>
          <hr />
          {discuss}
        </div>
        {button}
        </main>
      </div>
    );
      /*eslint-enable react/no-danger*/
  }
}