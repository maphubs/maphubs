// @flow
import React from 'react'
import slugify from 'slugify'
import Actions from '../../actions/StoryActions'
import MessageActions from '../../actions/MessageActions'
import NotificationActions from '../../actions/NotificationActions'
import ConfirmationActions from '../../actions/ConfirmationActions'
import AddMapModal from './AddMapModal'
import ImageCrop from '../ImageCrop'
import StoryStore from '../../stores/StoryStore'
import Progress from '../Progress'
import Editor from 'react-medium-editor'
import MapHubsComponent from '../MapHubsComponent'
import Reflux from '../Rehydrate'
import type {LocaleStoreState} from '../../stores/LocaleStore'
import type {Story, StoryStoreState} from '../../stores/StoryStore'
import FloatingButton from '../FloatingButton'
import {Tooltip} from 'react-tippy'

const $ = require('jquery')
const debounce = require('lodash.debounce')
const _isequal = require('lodash.isequal')
const urlUtil = require('../../services/url-util')

type Props = {|
  story: Story,
  hub_id?: string,
  storyType: string,
  username: string,
  myMaps: Array<Object>,
  popularMaps: Array<Object>
|}

type StoryEditorState = {|
  story: Object,
  saving: boolean,
  addingMap: boolean
|}

type State = LocaleStoreState & StoryStoreState & StoryEditorState

export default class StoryEditor extends MapHubsComponent<Props, State> {
  props: Props

  static defaultProps = {
    story: {},
    username: '',
    storyType: 'unknown'
  }

  state: State = {
    story: {},
    saving: false,
    addingMap: false
  }

  savedSelectionRange: any
  body: any

  constructor (props: Props) {
    super(props)
    this.stores.push(StoryStore)
    Reflux.rehydrate(StoryStore, {story: this.props.story, storyType: this.props.storyType, hub_id: this.props.hub_id})
  }

  componentDidMount () {
    const _this = this

    $('.storybody').on('focus', () => {
      NotificationActions.dismissNotification()
    })

    $('.storybody').on('click', function () {
      const debounced = debounce(() => {
        _this.saveSelectionRange()
      }, 500).bind(this)
      debounced()
    })
    this.addMapCloseButtons()
    this.addImageButtons()

    window.onbeforeunload = function () {
      if (_this.state.unsavedChanges) {
        return _this.__('You have not saved the edits for your story, your changes will be lost.')
      }
    }

    M.FloatingActionButton.init(this.refs.saveButton, {})
    M.FloatingActionButton.init(this.refs.addButton, {})
  }

  shouldComponentUpdate (nextProps: Props, nextState: State) {
    if (nextState.addingMap) return true
    // only update if something changes
    if (!_isequal(this.props, nextProps)) {
      return true
    }
    if (!_isequal(this.state, nextState)) {
      if (this.body && _isequal(this.body, nextState.story.body)) {
        this.body = null
        return false
      }
      return true
    }
    return false
  }

  componentDidUpdate (prevProps: Props, prevState: State) {
    if (!prevState.story.story_id && this.state.story.story_id) {
      M.FloatingActionButton.init(this.refs.deleteButton, {})
    }
  }

  handleBodyChange = (body) => {
    const _this = this
    this.body = body
    Actions.handleBodyChange(body)
    const debounced = debounce(() => {
      _this.saveSelectionRange()
    }, 500).bind(this)
    debounced()
  }

getFirstLine = () => {
  const firstLine = $('.storybody').find('p')
    .filter(function () {
      return ($.trim($(this).text()).length)
    }).first().text()
  return firstLine
}

getFirstImage = () => {
  // attempt to find the first map or image
  let firstImg = null
  const firstEmbed = $('.storybody').find('img, .embed-map-container').first()
  if (firstEmbed.is('.embed-map-container')) {
    const mapid = firstEmbed.attr('id').split('-')[1]
    firstImg = urlUtil.getBaseUrl() + '/api/screenshot/map/' + mapid + '.png'
  } else {
    firstImg = firstEmbed.attr('src')
  }
  return firstImg
}

save = () => {
  const _this = this

  if (!this.state.story.title || this.state.story.title === '') {
    NotificationActions.showNotification({message: _this.__('Please Add a Title'), dismissAfter: 5000, position: 'bottomleft'})
    return
  }

  // if this is a hub story, require an author
  if (this.props.storyType === 'hub' && !this.state.story.author) {
    NotificationActions.showNotification({message: _this.__('Please Add an Author'), dismissAfter: 5000, position: 'bottomleft'})
    return
  }

  // remove the map buttons so they are not saved
  this.removeMapCloseButtons()
  this.removeImageButtons()
  const body = $('.storybody').html()
  this.setState({saving: true})

  // get first line
  const firstline = this.getFirstLine()

  // get first image
  const firstimage = this.getFirstImage()

  Actions.save(body, firstline, firstimage, this.state._csrf, (err: Error) => {
    _this.setState({saving: false})
    if (err) {
      MessageActions.showMessage({title: _this.__('Error'), message: err})
    } else {
      _this.addMapCloseButtons() // put back the close buttons
      _this.addImageButtons()
      if (!_this.state.story.published) {
        NotificationActions.showNotification({message: _this.__('Story Saved'),
          action: _this.__('Publish'),
          dismissAfter: 10000,
          onDismiss () {

          },
          onClick () {
            _this.publish()
          }
        })
      } else {
        NotificationActions.showNotification({message: _this.__('Story Saved'),
          action: _this.__('View Story'),
          dismissAfter: 10000,
          onDismiss () {

          },
          onClick () {
            let title = ''
            if (_this.state.story.title) {
              title = slugify(_this.state.story.title)
            }
            if (_this.props.storyType === 'user') {
              window.location = `/user/${_this.props.username}/story/${_this.state.story.story_id}/${title}`
            } else if (_this.props.hub_id) {
              window.location = `/hub/${_this.props.hub_id}/story/${_this.state.story.story_id}/${title}`
            }
          }
        })
      }
    }
  })
}

delete = () => {
  const _this = this
  ConfirmationActions.showConfirmation({
    title: _this.__('Confirm Delete'),
    message: _this.__('Please confirm removal of ') + this.state.story.title,
    onPositiveResponse () {
      Actions.delete(_this.state._csrf, (err) => {
        if (err) {
          MessageActions.showMessage({title: _this.__('Error'), message: err})
        } else {
          NotificationActions.showNotification({
            message: _this.__('Story Deleted'),
            dismissAfter: 1000,
            onDismiss () {
              window.location = '/'
            }
          })
        }
      })
    }
  })
}

getSelectionRange = () => {
  let sel, range
  if (window.getSelection) {
    // IE9 and non-IE
    sel = window.getSelection()

    if (sel.getRangeAt && sel.rangeCount) {
      range = sel.getRangeAt(0)
      return range
    }
  } else if ((sel = document.selection) && sel.type !== 'Control') {
    // IE < 9
    const originalRange = sel.createRange()
    originalRange.collapse(true)
    range = sel.createRange()
    return range
  }
}

pasteHtmlAtCaret = (html: any, rangeInput: any = null) => {
  let sel
  let savedRange = this.savedSelectionRange
  const selection = window.getSelection()
  let range = null
  if (rangeInput) {
    range = rangeInput
  } else {
    range = document.createRange()
    range.setStart(savedRange.startContainer, savedRange.startOffset)
    range.setEnd(savedRange.endContainer, savedRange.endOffset)
  }
  selection.addRange(range)
  if (selection) {
    range.deleteContents()

    // Range.createContextualFragment() would be useful here but is
    // only relatively recently standardized and is not supported in
    // some browsers (IE9, for one)
    const el = document.createElement('p')
    el.innerHTML = html
    let frag = document.createDocumentFragment()
    let node
    while ((node = el.firstChild)) {
      frag.appendChild(node)
    }
    range.insertNode(frag)
  } else if ((sel = document.selection) && sel.type !== 'Control') {
    // IE < 9
    range.pasteHTML(html)
  }
  this.handleBodyChange($('.storybody').html())
}

onAddMap = (map: Object) => {
  const _this = this
  const mapId = map.map_id
  // this.setState({addingMap: true});
  this.removeMapCloseButtons()
  const range = null

  let url = urlUtil.getBaseUrl() + '/map/embed/' + mapId + '/static'

  url = url.replace(/http:/, '')
  url = url.replace(/https:/, '')
  this.pasteHtmlAtCaret('<div contenteditable="false" class="embed-map-container" id="map-' + mapId + '"><iframe src="' + url +
  '" style="" frameborder="0" allowFullScreen="true" webkitallowfullscreen="true" mozallowfullscreen="true"></iframe>' +
  '</div>' +
  '<br />' +
  '<p></p>',
  range
  )

  this.addMapCloseButtons()

  _this.handleBodyChange($('.storybody').html())
}

onMapCancel = () => {
  this.setState({addingMap: false})
  this.removeMapCloseButtons()
  this.addMapCloseButtons()
}

removeMap = (mapId: number) => {
  const _this = this
  ConfirmationActions.showConfirmation({
    title: _this.__('Confirm Map Removal'),
    message: _this.__('Please confirm that you want to remove this map'),
    onPositiveResponse () {
      $('#map-' + mapId).remove()
      _this.handleBodyChange($('.storybody').html())
    }
  })
}

addMapCloseButtons = () => {
  const _this = this
  $('.embed-map-container').each((i, map) => {
    const mapId = map.id.split('-')[1]

    $(map).append(`<div class="map-remove-button-v2" style="position: absolute; top: 10px; right: 80px;">
    <i class="material-icons story-media-edit-button">close</i>
    </div>`)

    $(map).find('i').first().click(() => {
      _this.removeMap(mapId)
    })
  })
}

removeMapCloseButtons = () => {
  $('.map-remove-button-v2').each((i, button) => {
    $(button).remove()
  })
}

addImageButtons = () => {
  const _this = this
  $('.embed-image-container').each((i, image) => {
    const imageId = image.id.split('-')[1]
    $(image).append(`<div class="image-remove-button-v2" style="position: absolute; top: 10px; right: 10px;">
    <i class="material-icons story-media-edit-button">close</i>
    </div>`)
    $(image).find('i').click(() => {
      _this.onRemoveImage(imageId)
    })
  })
}

removeImageButtons = () => {
  $('.image-remove-button-v2').each((i, button) => {
    $(button).remove()
  })
}

onAddImage = (data: string, info: Object) => {
  const _this = this
  Actions.addImage(data, info, this.state._csrf, (err, res) => {
    if (err || !res.body || !res.body.image_id) {
      MessageActions.showMessage({title: _this.__('Error'), message: err})
    } else {
      const imageId = res.body.image_id
      const url = '/images/story/' + _this.state.story.story_id + '/image/' + imageId + '.jpg'
      // <div contenteditable="false" class="embed-map-container" id="map-' + map_id + '"
      _this.pasteHtmlAtCaret('<div contenteditable="false" id="image-' + imageId + '" class="embed-image-container center-align"><img class="responsive-img" src="' + url + '" /></div><br /><p></p>')
      NotificationActions.showNotification({message: _this.__('Image Added')})
      _this.addImageButtons()
    }
  })
}

onRemoveImage = (imageId: number) => {
  const _this = this
  ConfirmationActions.showConfirmation({
    title: _this.__('Confirm Image Removal'),
    message: _this.__('Please confirm that you want to remove this image'),
    onPositiveResponse () {
      Actions.removeImage(imageId, _this.state._csrf, (err) => {
        if (err) {
          MessageActions.showMessage({title: _this.__('Error'), message: err})
        } else {
          // remove from content
          $('#image-' + imageId).remove()
          _this.handleBodyChange($('.storybody').html())
          NotificationActions.showNotification({message: _this.__('Image Removed')})
        }
      })
    }
  })
}

publish = () => {
  const _this = this
  ConfirmationActions.showConfirmation({
    title: _this.__('Publish story?'),
    message: _this.__('Please confirm that you want to publish this story'),
    onPositiveResponse () {
      if (!_this.state.story.title || _this.state.story.title === '') {
        NotificationActions.showNotification({message: _this.__('Please Add a Title'), dismissAfter: 5000, position: 'bottomleft'})
        return
      }

      // if this is a hub story, require an author
      if (_this.props.storyType === 'hub' && !_this.state.story.author) {
        NotificationActions.showNotification({message: _this.__('Please Add an Author'), dismissAfter: 5000, position: 'bottomleft'})
        return
      }

      // remove the map buttons so they are not saved
      _this.removeMapCloseButtons()
      _this.removeImageButtons()
      const body = $('.storybody').html()
      _this.setState({saving: true})

      // get first line
      const firstline = _this.getFirstLine()

      // get first image
      const firstimage = _this.getFirstImage()

      Actions.save(body, firstline, firstimage, _this.state._csrf, (err: Error) => {
        _this.setState({saving: false})
        if (err) {
          MessageActions.showMessage({title: _this.__('Error'), message: err})
        } else {
          Actions.publish(_this.state._csrf, (err) => {
            if (err) {
              MessageActions.showMessage({title: _this.__('Error'), message: err})
            } else {
              NotificationActions.showNotification({message: _this.__('Story Published'),
                action: _this.__('View Story'),
                dismissAfter: 10000,
                onDismiss () {

                },
                onClick () {
                  const storyTitle = (_this.state.story && _this.state.story.title) ? slugify(_this.state.story.title) : ''
                  if (_this.props.storyType === 'user') {
                    window.location = `/user/${_this.props.username}/story/${_this.state.story.story_id}/${storyTitle}`
                  } else {
                    const hubId = _this.props.hub_id ? _this.props.hub_id : 'unknown'
                    const baseUrl = `/hub/${hubId}`

                    window.location = `${baseUrl}/story/${_this.state.story.story_id}/${storyTitle}`
                  }
                }
              })
            }
          })
        }
      })
    }
  })
}

saveSelectionRange = () => {
  const sel = window.getSelection()

  if (sel.anchorNode && sel.anchorNode.parentNode) {
    const storyBody = $('.storybody')[0]
    const anchorNode = $(sel.anchorNode)[0]

    if ($.contains(storyBody, anchorNode) || $(sel.anchorNode).hasClass('storybody')) {
      const range = this.getSelectionRange()
      if (range) {
        this.savedSelectionRange = {
          'startContainer': range.startContainer,
          'startOffset': range.startOffset,
          'endContainer': range.endContainer,
          'endOffset': range.endOffset
        }
      }
    } else {
      this.savedSelectionRange = null
    }
  } else {
    this.savedSelectionRange = null
  }
}

showAddMap = () => {
  if (this.savedSelectionRange) {
    this.refs.addmap.show()
  } else {
    NotificationActions.showNotification({message: this.__('Please Select a Line in the Story'), position: 'bottomleft'})
  }
}

showImageCrop = () => {
  if (!this.state.story.story_id || this.state.story.story_id === -1) {
    NotificationActions.showNotification({message: this.__('Please Save the Story Before Adding in Image'), dismissAfter: 5000, position: 'bottomleft'})
    return
  }
  if (this.savedSelectionRange) {
    this.refs.imagecrop.show()
  } else {
    NotificationActions.showNotification({message: this.__('Please Select a Line in the Story'), position: 'bottomleft'})
  }
}

render () {
  let author = ''
  if (this.props.storyType === 'hub') {
    author = (
      <div className='story-author' style={{height: '30px'}}>
        <Editor
          tag='b'
          text={this.state.story.author}
          onChange={Actions.handleAuthorChange}
          options={{buttonLabels: false,
            placeholder: {text: this.__('Enter the Author')},
            disableReturn: true,
            imageDragging: false,
            toolbar: {buttons: []}}}
        />
      </div>
    )
  }

  let deleteButton = ''
  if (this.state.story.story_id) {
    deleteButton = (
      <div ref='deleteButton' className='fixed-action-btn action-button-bottom-right' style={{marginRight: '70px'}}>
        <FloatingButton
          onClick={this.delete}
          tooltip={this.__('Delete')}
          color='red' icon='delete' />
      </div>
    )
  }
  let publishButton = ''
  let saveButtonText = this.__('Save')
  if (!this.state.story.published) {
    publishButton = (
      <div className='center center-align' style={{margin: 'auto', position: 'fixed', bottom: '15px', zIndex: '1', right: 'calc(50% - 60px)'}}>
        <button className='waves-effect waves-light btn' onClick={this.publish}>{this.__('Publish')}</button>
      </div>
    )
    saveButtonText = this.__('Save Draft')
  }

  return (
    <div style={{position: 'relative'}}>
      <div className='edit-header omh-color' style={{opacity: 0.5}}>
        <p style={{textAlign: 'center', color: '#FFF'}}>{this.__('Editing Story')}</p>
      </div>
      {publishButton}
      <div className='container editor-container'>
        <div className='story-title'>
          <Editor
            tag='h3'
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
        <div className='story-content'>
          <Editor
            className='storybody'
            text={this.state.story.body}
            onChange={this.handleBodyChange}
            options={{
              buttonLabels: 'fontawesome',
              delay: 100,
              placeholder: {text: this.__('Type your Story Here')},
              toolbar: {
                buttons: ['bold', 'italic', 'underline', 'anchor', 'h5', 'justifyLeft', 'justifyCenter', 'justifyRight', 'quote', 'orderedlist', 'unorderedlist', 'pre', 'removeFormat']
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
      <div className='row' style={{position: 'absolute', top: '25px', right: '5px'}}>
        <div className='col s12' style={{border: '1px solid RGBA(0,0,0,.7)'}}>
          <p style={{margin: '5px'}}>{this.__('Select Text to See Formatting Options')}</p>
        </div>
      </div>

      <AddMapModal ref='addmap'
        onAdd={this.onAddMap} onClose={this.onMapCancel}
        myMaps={this.props.myMaps} popularMaps={this.props.popularMaps} />

      <ImageCrop ref='imagecrop' onCrop={this.onAddImage} resize_max_width={1200} />

      <div ref='addButton' className='fixed-action-btn action-button-bottom-right' style={{bottom: '155px'}}>
        <a onMouseDown={function (e) { e.stopPropagation() }} className='btn-floating btn-large red red-text'>
          <i className='large material-icons'>add</i>
        </a>
        <ul>
          <li>
            <Tooltip
              title={this.__('Insert Map')}
              position='left' inertia followCursor
            >
              <a onMouseDown={this.showAddMap} className='btn-floating green darken-1'>
                <i className='material-icons'>map</i>
              </a>
            </Tooltip>
          </li>
          <li>
            <Tooltip
              title={this.__('Insert Image')}
              position='left' inertia followCursor
            >
              <a onMouseDown={this.showImageCrop} className='btn-floating yellow'>
                <i className='material-icons'>insert_photo</i>
              </a>
            </Tooltip>
          </li>
        </ul>
      </div>
      <div ref='saveButton' className='fixed-action-btn action-button-bottom-right'>
        <FloatingButton
          onClick={this.save}
          tooltip={saveButtonText}
          color='blue' icon='save' />
      </div>
      {deleteButton}

      <Progress id='adding-map-progess' title={this.__('Adding Map')} subTitle={''} dismissible={false} show={this.state.addingMap} />
      <Progress id='saving-story' title={this.__('Saving')} subTitle='' dismissible={false} show={this.state.saving} />
    </div>
  )
}
}
