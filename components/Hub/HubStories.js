var React = require('react');
var slug = require('slug');
var StorySummary = require('../Story/StorySummary');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');

var HubStories = React.createClass({

  mixins:[StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    hub: React.PropTypes.object.isRequired,
    stories: React.PropTypes.array,
    limit: React.PropTypes.number,
    editing: React.PropTypes.bool
  },
  getDefaultProps() {
    return {
      stories: [],
      limit: 0,
      editing: false
    };
  },

  render() {
    var _this = this;
    var addButton = '';
    if(_this.props.editing){
      addButton = (
        <div>
          <a href="/story/create" target="_blank" className="btn center-align center"><i className="material-icons left">add</i>{this.__('Add Story')}</a>
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
                <a className="secondary-content" href={'/story/' + story.story_id + '/edit/' + slug(story.title)}>
                  <i className="material-icons">edit</i>
                </a>
              );
            }
            if(_this.props.limit > 0 && i+1 > _this.props.limit){
              return (<div></div>);
            }
            return (
                <div className="card" key={story.story_id}>
                  <div className="card-content">
                  {editButton}
                  <StorySummary story={story} />
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
