// @flow
import Reflux from 'reflux';
import Actions from '../actions/StoryActions';
var request = require('superagent');
var checkClientError = require('../services/client-error-response').checkClientError;
//var debug = require('../services/debug')('layer-store');

export default class StoryStore extends Reflux.Store {

  constructor(){
    super();
    this.state = {
      story: {},
      storyType: 'unknown',
      hub_id: null,
      unsavedChanges: false
    };
    this.listenables = Actions;
  }

  handleBodyChange(body: string) {
      var story = this.state.story;
      story.body = body;
      this.setState({story, unsavedChanges: true});      
  }

  handleTitleChange(title: string) {
    var story = this.state.story;
    story.title = title;
    this.setState({story, unsavedChanges: true});
  }

  handleAuthorChange(author: string) {
    var story = this.state.story;
    story.author = author;
    this.setState({story, unsavedChanges: true});
  }

  save(body: string, firstline: string, firstimage: any, _csrf: string, cb){
    var _this = this;

    var data = this.state.story;

    data.firstline = firstline;
    data.firstimage = firstimage;
    data._csrf = _csrf;

    request.post('/api/story/save')
    .type('json').accept('json')
    .send(data)
    .end(function(err, res){
      checkClientError(res, err, cb, function(cb){
        var story = _this.state.story;
        if(res.body.story_id){   
          story.story_id = res.body.story_id;
        }
        _this.setState({story, unsavedChanges: false});
        cb(null, story);
      });
    });
  }

  addImage(data: string, info: Object, _csrf: string, cb: Function){
  var _this = this;
  request.post('/api/story/addimage')
  .type('json').accept('json')
  .send({story_id: _this.state.story.story_id, image: data, info, _csrf})
  .end(function(err, res){
    checkClientError(res, err, cb, function(cb){
       cb(null, res);
    });
  });
}

removeImage(image_id: number, _csrf: string, cb: Function){
  var _this = this;
    request.post('/api/story/removeimage')
    .type('json').accept('json')
    .send({story_id: _this.state.story.story_id, image_id, _csrf})
    .end(function(err, res){
        checkClientError(res, err, cb, function(cb){cb();});
    });
}

  publish(_csrf: string, cb: Function){
  var _this = this;
  request.post('/api/story/publish')
      .type('json').accept('json')
      .send({story_id: _this.state.story.story_id, _csrf})
      .end(function(err, res){
        checkClientError(res, err, cb, function(cb){cb();});
      });
  }

  delete(_csrf: string, cb: Function){
  var _this = this;
  request.post('/api/story/delete')
      .type('json').accept('json')
      .send({story_id: _this.state.story.story_id, _csrf})
      .end(function(err, res){
        checkClientError(res, err, cb, function(cb){cb();});
      });
  }

}