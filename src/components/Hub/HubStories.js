import React from 'react';
import PropTypes from 'prop-types';
var slug = require('slug');
var StorySummary = require('../Story/StorySummary');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');
var _isequal = require('lodash.isequal');

var HubStories = React.createClass({

  mixins:[StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    hub: PropTypes.object.isRequired,
    stories: PropTypes.array,
    limit: PropTypes.number,
    editing: PropTypes.bool
  },
  getDefaultProps() {
    return {
      stories: [],
      limit: 0,
      editing: false
    };
  },

  shouldComponentUpdate(nextProps, nextState){
    //only update if something changes
    if(!_isequal(this.props, nextProps)){
      return true;
    }
    if(!_isequal(this.state, nextState)){
      return true;
    }
    return false;
  },

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
          {this.props.stories.map(function (story, i) {
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

});

module.exports = HubStories;
