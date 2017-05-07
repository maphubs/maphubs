// @flow
import React from 'react';
var slug = require('slug');
var $ = require('jquery');
var debounce = require('lodash.debounce');
var _isequal = require('lodash.isequal');
import Actions from '../../actions/StoryActions';
import MessageActions from '../../actions/MessageActions';
import NotificationActions from '../../actions/NotificationActions';
import ConfirmationActions from '../../actions/ConfirmationActions';
var urlUtil = require('../../services/url-util');
import AddMapModal from './AddMapModal';
import ImageCrop from '../ImageCrop';
import StoryStore from '../../stores/StoryStore';
import Progress from '../Progress';
import Editor from 'react-medium-editor';
import MapHubsComponent from '../../components/MapHubsComponent';
import Reflux from '../Rehydrate';
import type {LocaleStoreState} from '../../stores/LocaleStore';
import type {Story, StoryStoreState} from '../../stores/StoryStore';

type Props = {
    story: Story,
    hub_id: string,
    storyType: string,
    username: string,
    myMaps: Array<Object>,
    popularMaps: Array<Object>
  }

type StoryEditorState = {
  saving: boolean,
  addingMap: boolean
}

type State = LocaleStoreState & StoryStoreState & StoryEditorState

export default class StoryEditor extends MapHubsComponent<void, Props, State> {

  props: Props

  static defaultProps = {
    story: {},
    hub_id: null,
    username: '',
    storyType: 'unknown'
  }

  state: State = {
    story: {},
    saving: false,
    addingMap: false
  }

  constructor(props: Object){
		super(props);
    this.stores.push(StoryStore);
    Reflux.rehydrate(StoryStore, {story: this.props.story, storyType: this.props.storyType, hub_id: this.props.hub_id});
	}

  componentDidMount(){
   var _this = this;

   $('.storybody').on('focus', () => {
     NotificationActions.dismissNotification();
   });

   $('.storybody').on('click', function(){
     var debounced = debounce(() => {
       _this.saveSelectionRange();
     }, 500).bind(this);
     debounced();
   });
   this.addMapCloseButtons();
   this.addImageButtons();

   window.onbeforeunload = function(){
     if(_this.state.unsavedChanges){
       return _this.__('You have not saved the edits for your story, your changes will be lost.');
     }
   };

   $('.storyeditor-tooltips').tooltip();
 }

 shouldComponentUpdate(nextProps: Object, nextState: Object) {
   if(nextState.addingMap) return true;
    //only update if something changes
    if(!_isequal(this.props, nextProps)){
      return true;
    }
    if(!_isequal(this.state, nextState)){
      if(this.body && _isequal(this.body, nextState.story.body)){
        this.body = null;
        return false;
      }
      return true;
    }
    return false;
 }

  handleBodyChange = (body) => {
    var _this = this;
    this.body = body;
    Actions.handleBodyChange(body);        
    var debounced = debounce(() => {
        _this.saveSelectionRange();
    }, 500).bind(this);
    debounced();
  }

getFirstLine = () =>{
  var first_line = $('.storybody').find('p')
    .filter( function(){
       return ($.trim($(this).text()).length);
     }).first().text();
  return  first_line;
}

getFirstImage = () =>{
  //attempt to find the first map or image
  var first_img = null;
  var firstEmbed = $('.storybody').find('img, .embed-map-container').first();
  if(firstEmbed.is('.embed-map-container')){
    var mapid = firstEmbed.attr('id').split('-')[1];
    first_img = urlUtil.getBaseUrl() + '/api/screenshot/map/'+ mapid + '.png';
  }else{
    first_img = firstEmbed.attr('src');
  }
  return first_img;
}

save = () => {
  var _this = this;

  if(!this.state.story.title || this.state.story.title === ''){
    NotificationActions.showNotification({message: _this.__('Please Add a Title'), dismissAfter: 5000, position: 'bottomleft'});
    return;
  }

  //if this is a hub story, require an author
  if(this.props.storyType === 'hub' && !this.state.story.author){
    NotificationActions.showNotification({message: _this.__('Please Add an Author'), dismissAfter: 5000, position: 'bottomleft'});
    return;
  }

  //remove the map buttons so they are not saved
  this.removeMapCloseButtons();
  this.removeImageButtons();
  var body = $('.storybody').html();
  this.setState({saving: true});

  //get first line
  var firstline = this.getFirstLine();

  //get first image
  var firstimage = this.getFirstImage();

  Actions.save(body, firstline, firstimage, this.state._csrf, (err: Error) => {
      _this.setState({saving: false});
      if(err){
        MessageActions.showMessage({title: _this.__('Error'), message: err});
      }else{         
        _this.addMapCloseButtons(); //put back the close buttons
        _this.addImageButtons();
        if(!_this.state.story.published){
           NotificationActions.showNotification({message: _this.__('Story Saved'), action: _this.__('Publish'),
          dismissAfter: 10000,
          onDismiss(){

          },
          onClick(){
            _this.publish();
          }
        });
        }else{
          NotificationActions.showNotification({message: _this.__('Story Saved'), action: _this.__('View Story'),
          dismissAfter: 10000,
          onDismiss(){

          },
          onClick(){
            if(_this.props.storyType === 'user'){
              window.location = '/user/' + _this.props.username + '/story/' + _this.state.story.story_id + '/' + slug(_this.state.story.title);
            }else{
              var baseUrl = '/hub/' + _this.props.hub_id;              
              window.location = baseUrl + '/story/' + _this.state.story.story_id + '/' + slug(_this.state.story.title);
            }
          }
        });
        }
       
      }
  });
}

delete = () => {
  var _this = this;
  ConfirmationActions.showConfirmation({
    title: _this.__('Confirm Delete'),
    message: _this.__('Please confirm removal of ') + this.state.story.title,
    onPositiveResponse(){
      Actions.delete(_this.state._csrf, (err) => {
        if(err){
              MessageActions.showMessage({title: _this.__('Error'), message: err});
            }else{
              NotificationActions.showNotification({
                message: _this.__('Story Deleted'),
                dismissAfter: 1000,
                onDismiss(){
                  window.location = '/';
                }
              });
            }
      });     
    }
  });
}

getSelectionRange = () => {
  var sel, range;
  if (window.getSelection) {
      // IE9 and non-IE
      sel = window.getSelection();

      if (sel.getRangeAt && sel.rangeCount) {
          range = sel.getRangeAt(0);
          return range;
      }
  } else if ( (sel = document.selection) && sel.type !== "Control") {
      // IE < 9
      var originalRange = sel.createRange();
      originalRange.collapse(true);
      range = sel.createRange();
      return range;
  }
}

pasteHtmlAtCaret = (html: any, rangeInput: any=null) => {
    var sel, savedRange = this.savedSelectionRange;
    var selection = window.getSelection();
    var range = null;
    if(rangeInput){
      range = rangeInput;
    }else{
      range = document.createRange();
      range.setStart(savedRange.startContainer, savedRange.startOffset);
      range.setEnd(savedRange.endContainer, savedRange.endOffset);
    }
    selection.addRange(range);
    if (selection) {
        range.deleteContents();

        // Range.createContextualFragment() would be useful here but is
        // only relatively recently standardized and is not supported in
        // some browsers (IE9, for one)
        var el = document.createElement("p");
        el.innerHTML = html;
        var frag = document.createDocumentFragment(), node;
        while ( (node = el.firstChild) ) {
            frag.appendChild(node);
        }
        range.insertNode(frag);

    } else if ( (sel = document.selection) && sel.type !== "Control") {
        // IE < 9
        range.pasteHTML(html);
    }
    this.handleBodyChange($('.storybody').html());
}

onAddMap = (map: Object) => {
  var _this = this;
  var map_id = map.map_id;
  //this.setState({addingMap: true});
  this.removeMapCloseButtons();
  var range = null;

  var url = urlUtil.getBaseUrl() + '/map/embed/' + map_id + '/static';

  url = url.replace(/http:/, '');
  url = url.replace(/https:/, '');
  this.pasteHtmlAtCaret('<div contenteditable="false" class="embed-map-container" id="map-' + map_id + '"><iframe src="' + url
  + '" style="" frameborder="0"></iframe>'
  + '</div>'
  + '<br />'
  + '<p></p>',
  range
  );

  _this.handleBodyChange($('.storybody').html());
}

onMapCancel = () => {
  this.setState({addingMap: false});
  this.removeMapCloseButtons();
  this.addMapCloseButtons();
}

removeMap = (map_id: number) => { 
  var _this = this;
  ConfirmationActions.showConfirmation({
    title: _this.__('Confirm Map Removal'),
    message: _this.__('Please confirm that you want to remove this map'),
    onPositiveResponse(){
      $('#map-'+map_id).remove();
      _this.handleBodyChange($('.storybody').html());
    }
  });
}

addMapCloseButtons = () => {
  var _this = this;
  $('.embed-map-container').each((i, map) => {
    var map_id = map.id.split('-')[1];

    $(map).append(`<div class="map-remove-button" style="position: absolute; top: 10px; right: 80px;">
    <i class="material-icons edit-map-tooltips story-media-edit-button"
      data-position="bottom" data-delay="50" data-tooltip="` +_this.__('Remove Map') + `"
      >close</i>

    </div>`);

    $(map).find('i').first().click(() => {
      _this.removeMap(map_id);
    });

    $('.edit-map-tooltips').tooltip();
  });
}

removeMapCloseButtons = () => {
  $('.edit-map-tooltips').tooltip('remove');
  $('.map-remove-button').each((i, button) => {
    $(button).remove();
  });
}

addImageButtons = () => {
  var _this = this;
  $('.embed-image-container').each((i, image) => {
    var image_id = image.id.split('-')[1];
    $(image).append( `<div class="image-remove-button" style="position: absolute; top: 10px; right: 10px;">
    <i class="material-icons remove-image-tooltips story-media-edit-button"
      data-position="bottom" data-delay="50" data-tooltip="`+ _this.__('Remove Image')+ `"
      >close</i>
    </div>`);
    $(image).find('i').click(() => {
      _this.onRemoveImage(image_id);
    });
    $('.remove-image-tooltips').tooltip();
  });
}

removeImageButtons = () => {
  $('.remove-image-tooltips').tooltip('remove');
  $('.image-remove-button').each((i, button) => {
    $(button).remove();
  });
}

onAddImage = (data: string, info: Object) => {
  var _this = this;
  Actions.addImage(data, info, this.state._csrf, (err, res) => {
    if(err || !res.body || !res.body.image_id){
      MessageActions.showMessage({title: _this.__('Error'), message: err});
    }else{
      var image_id = res.body.image_id;
      var url = '/images/story/' + _this.state.story.story_id + '/image/' + image_id + '.jpg';
      //<div contenteditable="false" class="embed-map-container" id="map-' + map_id + '"
      _this.pasteHtmlAtCaret('<div contenteditable="false" id="image-' + image_id + '" class="embed-image-container center-align"><img class="responsive-img" src="' + url + '" /></div><br /><p></p>');
      NotificationActions.showNotification({message: _this.__('Image Added')});
      _this.addImageButtons();
    }
  });
}

onRemoveImage = (image_id: number) => {
  var _this = this;
  ConfirmationActions.showConfirmation({
    title: _this.__('Confirm Image Removal'),
    message: _this.__('Please confirm that you want to remove this image'),
    onPositiveResponse(){
      Actions.removeImage(image_id, _this.state._csrf, (err) => {
          if(err){
            MessageActions.showMessage({title: _this.__('Error'), message: err});
          }else{
            //remove from content
              $('#image-'+image_id).remove();
              _this.handleBodyChange($('.storybody').html());
            NotificationActions.showNotification({message: _this.__('Image Removed')});
          }
      });
    }
  });
}

publish = () => {
   var _this = this;
  ConfirmationActions.showConfirmation({
    title: _this.__('Publish story?'),
    message: _this.__('Please confirm that you want to publish this story'),
    onPositiveResponse(){

    if(!_this.state.story.title || _this.state.story.title === ''){
      NotificationActions.showNotification({message: _this.__('Please Add a Title'), dismissAfter: 5000, position: 'bottomleft'});
      return;
    }

    //if this is a hub story, require an author
    if(_this.props.storyType === 'hub' && !_this.state.story.author){
      NotificationActions.showNotification({message: _this.__('Please Add an Author'), dismissAfter: 5000, position: 'bottomleft'});
      return;
    }

    //remove the map buttons so they are not saved
    _this.removeMapCloseButtons();
    _this.removeImageButtons();
    var body = $('.storybody').html();
    _this.setState({saving: true});

  //get first line
  var firstline = _this.getFirstLine();

  //get first image
  var firstimage = _this.getFirstImage();

  Actions.save(body, firstline, firstimage, _this.state._csrf, (err: Error) => {
      _this.setState({saving: false});
      if(err){
        MessageActions.showMessage({title: _this.__('Error'), message: err});
      }else{         
          Actions.publish(_this.state._csrf, (err) => {
        if(err){
          MessageActions.showMessage({title: _this.__('Error'), message: err});
        }else{
          NotificationActions.showNotification({message: _this.__('Story Published'), action: _this.__('View Story'),
          dismissAfter: 10000,
          onDismiss(){

          },
          onClick(){
            if(_this.props.storyType === 'user'){
              window.location = '/user/' + _this.props.username + '/story/' + _this.state.story.story_id + '/' + slug(_this.state.story.title);
            }else{
              var baseUrl = '/hub/' + _this.props.hub_id;              
              window.location = baseUrl + '/story/' + _this.state.story.story_id + '/' + slug(_this.state.story.title);
            }
          }
        });
        }
      });
      }
  });
      
    }
  });
}

saveSelectionRange = () => {
  var sel = window.getSelection();

  if(sel.anchorNode && sel.anchorNode.parentNode){
    var storyBody = $('.storybody')[0];
    var anchorNode = $(sel.anchorNode)[0];
  
    if($.contains(storyBody, anchorNode) || $(sel.anchorNode).hasClass('storybody')){
      var range = this.getSelectionRange();
      this.savedSelectionRange = {"startContainer": range.startContainer, "startOffset":range.startOffset,"endContainer":range.endContainer, "endOffset":range.endOffset};
    }else {
      this.savedSelectionRange = null;
    }
  }else {
    this.savedSelectionRange = null;
  }
}

showAddMap = () => {
  if(this.savedSelectionRange){
      this.refs.addmap.show();
  }else {
    NotificationActions.showNotification({message: this.__('Please Select a Line in the Story'), position: 'bottomleft'});
  }
}

showImageCrop = () => {
  if(!this.state.story.story_id || this.state.story.story_id === -1){
    NotificationActions.showNotification({message: this.__('Please Save the Story Before Adding in Image'), dismissAfter: 5000, position: 'bottomleft'});
    return;
  }
  if(this.savedSelectionRange){
    this.refs.imagecrop.show();
  }else {
    NotificationActions.showNotification({message: this.__('Please Select a Line in the Story'), position: 'bottomleft'});
  }
}

  render() {
    var author='';
    if(this.props.storyType === 'hub'){
      author = (
        <div className="story-author" style={{height: '30px'}}>
          <Editor
         tag="b"
         text={this.state.story.author}
         onChange={Actions.handleAuthorChange}
         options={{buttonLabels: false,
           placeholder: {text: this.__('Enter the Author')},
           disableReturn: true,
           imageDragging: false,
           toolbar: {buttons: []}}}
         />
      </div>
      );
    }

    var deleteButton = '';
    if(this.state.story.story_id){
      deleteButton = (
        <div className="fixed-action-btn action-button-bottom-right" style={{marginRight: '70px'}}>
          <a className="btn-floating btn-large red red-text storyeditor-tooltips" onClick={this.delete}
            data-delay="50" data-position="left" data-tooltip={this.__('Delete')}>
            <i className="large material-icons">delete</i>
          </a>
        </div>
      );
    }
    var publishButton = '';
    var saveButtonText = this.__('Save');
    if(!this.state.story.published){
        publishButton = (
          <div className="center center-align" style={{margin: 'auto', position: 'fixed', bottom: '15px', zIndex: '1', right: 'calc(50% - 60px)'}}>
            <button className="waves-effect waves-light btn" onClick={this.publish}>{this.__('Publish')}</button>
          </div>
        );
        saveButtonText = this.__('Save Draft');
      }

    return (
      <div style={{position: 'relative'}}>
        <div className="edit-header omh-color" style={{opacity: 0.5}}>
          <p style={{textAlign: 'center', color: '#FFF'}}>{this.__('Editing Story')}</p>
        </div>
        {publishButton}
        <div className="container editor-container">
          <div className="story-title">
            <Editor
           tag="h3"
           text={this.state.story.title}
           onChange={Actions.handleTitleChange}
           options={{buttonLabels: false,
             placeholder: {text: this.__('Enter a Title for Your Story')},
             disableReturn: true,
             imageDragging: false,
             toolbar: {buttons: []}
           }}
         />
        </div>
        {author}
       <div className="story-content">
         <Editor
           className="storybody"
           text={this.state.story.body}
           onChange={this.handleBodyChange}
           options={{
             buttonLabels: 'fontawesome',
             delay: 100,
             placeholder: {text: this.__('Type your Story Here')},
             toolbar: {
               buttons: ['bold', 'italic', 'underline', 'anchor', 'h5', 'justifyLeft', 'justifyCenter', 'justifyRight', 'quote','orderedlist','unorderedlist', 'pre','removeFormat']
             },
             paste: {
               forcePlainText: false,
               cleanPastedHTML: true
             },
              imageDragging: false
           }}
         />
       </div>
     </div>
       <div className="row" style={{position: 'absolute', top: '25px', right: '5px'}}>
         <div className="col s12" style={{border: '1px solid RGBA(0,0,0,.7)'}}>
           <p style={{margin: '5px'}}>{this.__('Select Text to See Formatting Options')}</p>
         </div>
       </div>

       <AddMapModal ref="addmap"
         onAdd={this.onAddMap} onClose={this.onMapCancel}
         myMaps={this.props.myMaps} popularMaps={this.props.popularMaps} />

       <ImageCrop ref="imagecrop" onCrop={this.onAddImage} resize_max_width={1200}/>

       <div className="fixed-action-btn action-button-bottom-right" style={{bottom: '155px'}}>
            <a onMouseDown={function(e){e.stopPropagation();}} className="btn-floating btn-large red red-text">
              <i className="large material-icons">add</i>
            </a>
            <ul>
              <li>
                <a  onMouseDown={this.showAddMap} className="btn-floating storyeditor-tooltips green darken-1" data-delay="50" data-position="left" data-tooltip={this.__('Insert Map')}>
                  <i className="material-icons">map</i>
                </a>
              </li>
              <li>
                <a onMouseDown={this.showImageCrop} className="btn-floating storyeditor-tooltips yellow" data-delay="50" data-position="left" data-tooltip={this.__('Insert Image')}>
                  <i className="material-icons">insert_photo</i>
                </a>
              </li>
            </ul>
          </div>
          <div className="fixed-action-btn action-button-bottom-right">
            <a className="btn-floating btn-large blue storyeditor-tooltips" onClick={this.save} data-delay="50" data-position="left" data-tooltip={saveButtonText}>
              <i className="large material-icons">save</i>
            </a>
          </div>
          {deleteButton}

          <Progress id="adding-map-progess" title={this.__('Adding Map')} subTitle={''} dismissible={false} show={this.state.addingMap}/>
          <Progress id="saving-story" title={this.__('Saving')} subTitle="" dismissible={false} show={this.state.saving}/>
      </div>
    );
  }
}