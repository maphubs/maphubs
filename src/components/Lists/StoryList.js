//@flow
import React from 'react';
import MapHubsComponent from '../MapHubsComponent';
import _isequal from 'lodash.isequal';
import slugify from 'slugify';

type Props = {|
  stories: Array<Object>,
  showTitle: boolean
|}

type DefaultProps = {
  showTitle: boolean
}

export default class StoryList extends MapHubsComponent<DefaultProps, Props, void> {

  static defaultProps: DefaultProps = {
    showTitle: true
  }

   shouldComponentUpdate(nextProps: Props){
    //only update if something changes
    if(!_isequal(this.props, nextProps)){
      return true;
    }
    return false;
  }

  render(){
    let title = '', className = "collection";
    if(this.props.showTitle){
      className = "collection with-header";
      title = (
        <li className="collection-header">
          <h4>{this.__('Stories')}</h4>
        </li>
      );
    }
    return (
      <ul className={className}>
        {title}
        {this.props.stories.map((story, i) => {
          let title = story.title;
          let storyUrl = '/story/' + story.story_id + '/' + slugify(title);
          return (
            <li className="collection-item" key={story.story_id}>
              <div>{title}                
                <a className="secondary-content" href={storyUrl}>
                  <i className="material-icons">info</i>
                </a>
              </div>
            </li>
          );
        })}
      </ul>
    );
  }
}