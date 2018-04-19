// @flow
import React from 'react'
import MessageActions from '../../actions/MessageActions'
import NotificationActions from '../../actions/NotificationActions'
import ImageCrop from '../ImageCrop'
import GroupStore from '../../stores/GroupStore'
import GroupActions from '../../actions/GroupActions'
import MapHubsComponent from '../../components/MapHubsComponent'
import type {LocaleStoreState} from '../../stores/LocaleStore'
import type {GroupStoreState} from '../../stores/GroupStore'
import classNames from 'classnames'

type Props = {|
  onSubmit: Function,
  active: boolean,
  showPrev: boolean,
  onPrev: Function
|}

type DefaultProps = {
  active: boolean
}

type State = {
  canSubmit: boolean
} & LocaleStoreState & GroupStoreState

export default class CreateGroupStep2 extends MapHubsComponent<Props, State> {
  props: Props

  static defaultProps: DefaultProps = {
    active: false
  }

  state: State = {
    canSubmit: false,
    group: {}, // replaced by store
    members: [] // replaced by store
  }

  constructor (props: Props) {
    super(props)
    this.stores.push(GroupStore)
  }

  submit = () => {
    this.props.onSubmit(this.state.group.group_id)
  }

  showImageCrop = () => {
    this.refs.imagecrop.show()
  }

  onCrop = (data: Object) => {
    const _this = this
    // send data to server
    GroupActions.setGroupImage(data, this.state._csrf, (err) => {
      if (err) {
        MessageActions.showMessage({title: _this.__('Server Error'), message: err})
      } else {
        NotificationActions.showNotification(
          {
            message: _this.__('Image Saved'),
            position: 'bottomright',
            dismissAfter: 3000
          })
      }
    })
    // this.pasteHtmlAtCaret('<img class="responsive-img" src="' + data + '" />');
  }

  render () {
    // hide if not active
    let className = classNames('row')
    if (!this.props.active) {
      className = classNames('row', 'hidden')
    }

    let prevButton = ''
    if (this.props.showPrev) {
      prevButton = (
        <div className='left'>
          <button className='waves-effect waves-light btn' onClick={this.props.onPrev}>{this.__('Previous Step')}</button>
        </div>
      )
    }

    let groupImage = ''
    // if group has an image use link,
    if (this.state.group && this.state.group.group_id && this.state.group.hasImage) {
      groupImage = (
        <img className='responsive-img' width={200} height={200} src={'/group/' + this.state.group.group_id + '/image?' + new Date().getTime()} />
      )
    } else {
    // else show default image
      groupImage = (
        <div className='circle valign-wrapper' style={{width: '200px', height: '200px'}}>
          <i className='material-icons' style={{fontSize: '100px', margin: 'auto'}}>group</i>
        </div>

      )
    }

    return (
      <div className={className}>
        <div className='container'>
          <div className='row'>
            <div className='col s12 m6 l6'>
              {groupImage}
            </div>
            <div className='col s12 m6 l6'>
              <button className='waves-effect waves-light btn' onClick={this.showImageCrop}>{this.__('Add Image')}</button>
              <p>{this.__('Upload an Image or Logo for Your Group (Optional)')}</p>
            </div>

          </div>
          <div className='row'>
            {prevButton}
            <div className='right'>
              <button className='waves-effect waves-light btn' onClick={this.submit}>{this.__('Save')}</button>
            </div>
          </div>
        </div>
        <ImageCrop ref='imagecrop' aspectRatio={1} lockAspect resize_width={600} resize_height={600} onCrop={this.onCrop} />
      </div>
    )
  }
}
