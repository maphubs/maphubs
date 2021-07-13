import React, { useState } from 'react'
import ImageCrop from '../ImageCrop'
import { message, notification, Modal, Tooltip } from 'antd'
import FeaturePhotoActions from '../../actions/FeaturePhotoActions'
import AddAPhotoIcon from '@material-ui/icons/AddAPhoto'
import GetAppIcon from '@material-ui/icons/GetApp'
import DeleteIcon from '@material-ui/icons/Delete'
const { confirm } = Modal
type Props = {
  photo?: Record<string, any>
  canEdit?: boolean
  t: (v: string) => string
}
const FeaturePhoto = ({ photo, canEdit, t }: Props): JSX.Element => {
  const [showImageCrop, setShowImageCrop] = useState(false)
  const onCrop = (data: string, info: Record<string, any>) => {
    const { _csrf } = this.state
    setShowImageCrop(false)
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
  const deletePhoto = () => {
    const { _csrf } = this.state
    confirm({
      title: t('Confirm Removal'),
      content: t('Are you sure you want to remove this photo?'),
      okText: t('Remove'),
      okType: 'danger',

      onOk() {
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

  if (photo?.photo_url) {
    return (
      <div>
        <img
          style={{
            width: '100%'
          }}
          src={photo.photo_url}
          alt='feature photo attachment'
        />
        {canEdit && (
          <div
            style={{
              height: '30px',
              position: 'relative'
            }}
          >
            <Tooltip title={t('Replace Photo')} placement='bottom'>
              <AddAPhotoIcon
                onClick={() => {
                  imagecrop.current.show()
                }}
                style={{
                  fontSize: '24px',
                  position: 'absolute',
                  top: '5px',
                  cursor: 'pointer',
                  right: '30px'
                }}
              />
            </Tooltip>
            <Tooltip title={t('Download Photo')} placement='bottom'>
              <a href={photo.photo_url} download>
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
            <Tooltip title={t('Remove Photo')} placement='bottom'>
              <DeleteIcon
                onClick={deletePhoto}
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
        )}
        {canEdit && (
          <ImageCrop
            visible={showImageCrop}
            onCancel={() => {
              setShowImageCrop(false)
            }}
            aspectRatio={1}
            lockAspect
            resize_max_width={1000}
            resize_max_height={1000}
            onCrop={onCrop}
          />
        )}
      </div>
    )
  } else {
    return canEdit ? (
      <div>
        <div
          style={{
            height: '30px',
            position: 'relative'
          }}
        >
          <Tooltip title={t('Add Photo')} position='left' inertia followCursor>
            <AddAPhotoIcon
              onClick={() => {
                setShowImageCrop(true)
              }}
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
        <ImageCrop
          visible={showImageCrop}
          onCancel={() => {
            setShowImageCrop(false)
          }}
          aspectRatio={1}
          lockAspect
          resize_max_width={1000}
          resize_max_height={1000}
          onCrop={onCrop}
        />
      </div>
    ) : (
      <div />
    )
  }
}
export default FeaturePhoto
