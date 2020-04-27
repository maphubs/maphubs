//  @flow
import React from 'react'
import MapHubsPureComponent from '../MapHubsPureComponent'
import ImageCrop from '../ImageCrop'
import { message, notification, Modal, Tooltip } from 'antd'
import FeaturePhotoActions from '../../actions/FeaturePhotoActions'
import AddAPhotoIcon from '@material-ui/icons/AddAPhoto'
import GetAppIcon from '@material-ui/icons/GetApp'
import DeleteIcon from '@material-ui/icons/Delete'
const { confirm } = Modal

type Props = {
  photo?: Object,
  canEdit?: boolean
}

export default class FeatureExport extends MapHubsPureComponent<Props, void> {
  showImageCrop = () => {
    this.refs.imagecrop.show()
  }

  onCrop = (data: Object, info: Object) => {
    const {t} = this
    const {_csrf} = this.state
    // send data to server
    FeaturePhotoActions.addPhoto(data, info, _csrf, (err) => {
      if (err) {
        notification.error({
          message: t('Error'),
          description: err.message || err.toString() || err,
          duration: 0
        })
      } else {
        message.success(t('Image Saved (reloading...)'), 1, () => {
          location.reload()
        })
      }
    })
  }

  deletePhoto = () => {
    const {t} = this
    const {_csrf} = this.state
    confirm({
      title: t('Confirm Removal'),
      content: t('Are you sure you want to remove this photo?'),
      okText: t('Remove'),
      okType: 'danger',
      onOk () {
        FeaturePhotoActions.removePhoto(_csrf, (err) => {
          if (err) {
            notification.error({
              message: t('Error'),
              description: err.message || err.toString() || err,
              duration: 0
            })
          } else {
            message.info(t('Image Removed'))
          }
        })
      }
    })
  }

  render () {
    const {t} = this
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
                title={t('Replace Photo')}
                placement='left'
              >
                <AddAPhotoIcon
                  className='material-icons valign'
                  onClick={this.showImageCrop}
                  style={{
                    fontSize: '24px',
                    position: 'absolute',
                    top: '5px',
                    cursor: 'pointer',
                    right: '30px'
                  }}
                />
              </Tooltip>
              <Tooltip
                title={t('Download Photo')}
                placement='left'
              >
                <a href={photoUrl} download>
                  <GetAppIcon
                    style={{
                      fontSize: '24px',
                      position: 'absolute',
                      top: '5px',
                      cursor: 'pointer',
                      right: '56px'
                    }}
                  />
                </a>
              </Tooltip>
              <Tooltip
                title={t('Remove Photo')}
                placement='left'
              >
                <DeleteIcon
                  onClick={this.deletePhoto}
                  style={{
                    fontSize: '24px',
                    position: 'absolute',
                    top: '5px',
                    cursor: 'pointer',
                    right: '5px'
                  }}
                />
              </Tooltip>
            </div>}
          {imageCrop}
        </div>
      )
    } else {
      if (canEdit) {
        return (
          <div>
            <div style={{height: '30px', position: 'relative'}}>
              <Tooltip
                title={t('Add Photo')}
                position='left'
                inertia followCursor
              >
                <AddAPhotoIcon
                  onClick={this.showImageCrop}
                  style={{
                    fontSize: '24px',
                    position: 'absolute',
                    top: '5px',
                    cursor: 'pointer',
                    right: '5px'
                  }}
                />
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
