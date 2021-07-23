import React, { useState } from 'react'
import ImageCrop from '../ImageCrop'
import { message, notification, Modal, Tooltip } from 'antd'
import AddAPhotoIcon from '@material-ui/icons/AddAPhoto'
import GetAppIcon from '@material-ui/icons/GetApp'
import DeleteIcon from '@material-ui/icons/Delete'
import { Feature } from '../../types/feature'
import request from 'superagent'
import { checkClientError } from '../../services/client-error-response'
import useT from '../../hooks/useT'

const { confirm } = Modal
type Props = {
  photo?: Record<string, any>
  feature?: Feature
  canEdit?: boolean
}
const FeaturePhoto = ({ photo, canEdit, feature }: Props): JSX.Element => {
  const { t } = useT()
  const [showImageCrop, setShowImageCrop] = useState(false)
  const [photoUrl, setPhotoUrl] = useState<string>(photo.photo_url)

  const onCrop = (data: string, info: Record<string, any>) => {
    setShowImageCrop(false)
    // send data to server
    request
      .post('/api/feature/photo/add')
      .type('json')
      .accept('json')
      .send({
        layer_id: feature.layer_id,
        mhid: feature.mhid,
        image: data,
        info
      })
      .end((err, res) => {
        checkClientError({
          res,
          err,
          onSuccess: () => {
            setPhotoUrl(res.body.photo_url)

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
          }
        })
      })
  }
  const deletePhoto = () => {
    confirm({
      title: t('Confirm Removal'),
      content: t('Are you sure you want to remove this photo?'),
      okText: t('Remove'),
      okType: 'danger',

      onOk() {
        request
          .post('/api/feature/photo/delete')
          .type('json')
          .accept('json')
          .send({
            layer_id: this.state.feature.layer_id,
            mhid: this.state.feature.mhid
          })
          .end((err, res) => {
            checkClientError({
              res,
              err,
              onSuccess: () => {
                setPhotoUrl(null)

                if (err) {
                  notification.error({
                    message: t('Error'),
                    description: err.message || err.toString() || err,
                    duration: 0
                  })
                } else {
                  message.info(t('Image Removed'))
                }
              }
            })
          })
      }
    })
  }

  if (photoUrl) {
    return (
      <div>
        <img
          style={{
            width: '100%'
          }}
          src={photoUrl}
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
                  setShowImageCrop(true)
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
          <Tooltip title={t('Add Photo')} placement='left'>
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
