//  @flow
import React from 'react'
import MapHubsPureComponent from '../MapHubsPureComponent'
import ImageCrop from '../ImageCrop'
import {Tooltip} from 'react-tippy'
import MessageActions from '../../actions/MessageActions'
import NotificationActions from '../../actions/NotificationActions'
import ConfirmationActions from '../../actions/ConfirmationActions'
import FeaturePhotoActions from '../../actions/FeaturePhotoActions'

type Props = {
  photo?: Object,
  canEdit?: boolean
}

export default class FeatureExport extends MapHubsPureComponent<Props, void> {
  showImageCrop = () => {
    this.refs.imagecrop.show()
  }

  onCrop = (data: Object, info: Object) => {
    const _this = this
    // send data to server
    FeaturePhotoActions.addPhoto(data, info, this.state._csrf, (err) => {
      if (err) {
        MessageActions.showMessage({title: _this.__('Server Error'), message: err})
      } else {
        NotificationActions.showNotification(
          {
            message: _this.__('Image Saved'),
            position: 'bottomright',
            dismissAfter: 3000,
            onDismiss () {
              location.reload()
            }
          })
      }
    })
  }

  deletePhoto = () => {
    const _this = this
    ConfirmationActions.showConfirmation({
      title: _this.__('Confirm Removal'),
      message: _this.__('Are you sure you want to remove this photo?'),
      onPositiveResponse () {
        FeaturePhotoActions.removePhoto(_this.state._csrf, (err) => {
          if (err) {
            MessageActions.showMessage({title: _this.__('Server Error'), message: err})
          } else {
            NotificationActions.showNotification(
              {
                message: _this.__('Image Removed'),
                position: 'bottomright',
                dismissAfter: 3000
              })
          }
        })
      }
    })
  }

  render () {
    const {photo, canEdit} = this.props

    let imageCrop = ''
    if (canEdit) {
      imageCrop = (
        <ImageCrop ref='imagecrop' aspectRatio={1} lockAspect resize_max_width={1000} resize_max_height={1000} onCrop={this.onCrop} />
      )
    }

    if (photo && photo.photo_id) {
      const photoUrl = `/feature/photo/${photo.photo_id}.jpg`

      return (
        <div>
          <img style={{width: '100%'}} src={photoUrl} alt='feature photo attachment' />
          {canEdit &&
            <div style={{height: '30px', position: 'relative'}}>
              <Tooltip
                title={this.__('Replace Photo')}
                position='left'
                inertia followCursor
              >
                <i
                  className='material-icons grey-text valign'
                  onClick={this.showImageCrop}
                  style={{
                    fontSize: '24px',
                    position: 'absolute',
                    top: '5px',
                    cursor: 'pointer',
                    right: '30px'}}>
                  add_a_photo
                </i>
              </Tooltip>
              <Tooltip
                title={this.__('Download Photo')}
                position='left'
                inertia followCursor
              >
                <a href={photoUrl} download>
                  <i
                    className='material-icons grey-text valign'
                    style={{
                      fontSize: '24px',
                      position: 'absolute',
                      top: '5px',
                      cursor: 'pointer',
                      right: '56px'}}>
                    get_app
                  </i>
                </a>
              </Tooltip>
              <Tooltip
                title={this.__('Remove Photo')}
                position='left'
                inertia followCursor
              >
                <i
                  className='material-icons grey-text valign'
                  onClick={this.deletePhoto}
                  style={{
                    fontSize: '24px',
                    position: 'absolute',
                    top: '5px',
                    cursor: 'pointer',
                    right: '5px'}}>
                  delete
                </i>
              </Tooltip>
            </div>
          }
          {imageCrop}
        </div>
      )
    } else {
      if (canEdit) {
        return (
          <div>
            <div style={{height: '30px', position: 'relative'}}>
              <Tooltip
                title={this.__('Add Photo')}
                position='left'
                inertia followCursor
              >
                <i
                  className='material-icons grey-text valign'
                  onClick={this.showImageCrop}
                  style={{
                    fontSize: '24px',
                    position: 'absolute',
                    top: '5px',
                    cursor: 'pointer',
                    right: '5px'}}>
                  add_a_photo
                </i>
              </Tooltip>
            </div>
            {imageCrop}
          </div>
        )
      } else {
        return (
          <div />
        )
      }
    }
  }
}
