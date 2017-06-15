//@flow
import React from 'react';
var slug = require('slug');
import StorySummary from '../Story/StorySummary';
import _isequal from 'lodash.isequal';
import MapHubsComponent from '../../components/MapHubsComponent';

type Props = {|
  hub: Object,
  stories: Array<Object>,
  limit: number,
  editing: boolean
|}

type DefaultProps = {
  stories: Array<Object>,
  limit: number,
  editing: boolean
}

type State = {}

export default class HubStories extends MapHubsComponent<DefaultProps, Props, State> {

  props: Props

  static defaultProps: DefaultProps = {
    stories: [],
    limit: 0,
    editing: false
  }

  shouldComponentUpdate(nextProps: Props, nextState: State){
    //only update if something changes
    if(!_isequal(this.props, nextProps)){
      return true;
    }
    if(!_isequal(this.state, nextState)){
      return true;
    }
    return false;
  }

  render() {
    var _this = this;
    var addButton = '';
    var baseUrl = '/hub/' + this.props.hub.hub_id;
    
    if(_this.props.editing){
      addButton = (
        <div>
          <a href={baseUrl + '/story/create'} className="btn center-align center"><i className="material-icons left">add</i>{this.__('Add Story')}</a>
        </div>

      );
    }
    return (
      <div>
        {addButton}
        <div>
          {this.props.stories.map((story, i) => {
            var editButton = '';
            if(_this.props.editing){
              editButton = (
                <a className="secondary-content" href={baseUrl + '/story/' + story.story_id + '/edit/' + slug(story.title)}>
                  <i className="material-icons">edit</i>
                </a>
              );
            }
            if(_this.props.limit > 0 && i+1 > _this.props.limit){
              return (<div></div>);
            }
            return (
                <div className="card" key={story.story_id} style={{maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto'}}>
                  <div className="card-content">
                  {editButton}
                  <StorySummary story={story} baseUrl={baseUrl} />
                </div>
              </div>
            );
          })}

        </div>
      </div>
    );
  }
}