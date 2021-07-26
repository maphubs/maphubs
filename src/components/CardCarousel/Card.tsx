import React, { useState } from 'react'
import { useRouter } from 'next/router'
import GroupTag from '../Groups/GroupTag'
import AddCircle from '@material-ui/icons/AddCircle'
import LockOpen from '@material-ui/icons/LockOpenTwoTone'
import { Card, Tooltip } from 'antd'
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount'
import MapIcon from '@material-ui/icons/Map'
import LayersIcon from '@material-ui/icons/Layers'
import LibraryBooksIcon from '@material-ui/icons/LibraryBooks'
import { LocalizedString } from '../../types/LocalizedString'
import { CSSProperties } from 'react'
import useT from '../../hooks/useT'
export type CardConfig = {
  id: string
  title?: LocalizedString
  description?: LocalizedString
  showDescription?: boolean
  image_url?: string
  link: string
  group: {
    group_id: string
  }
  data: Record<string, any>
  type: string
  isPublic?: boolean
  draft?: boolean
  onClick?: (...args: Array<any>) => any
}
type Props = {
  showAddButton?: boolean
} & CardConfig
type State = {
  imageFailed?: boolean
}
const MapHubsCard = ({
  showAddButton,
  onClick,
  data,
  link,
  group,
  type,
  image_url,
  showDescription,
  id,
  title,
  description,
  draft,
  isPublic
}: Props): JSX.Element => {
  const { t } = useT()
  const router = useRouter()
  const [imageFailed, setImageFailed] = useState(false)

  let icon = <></>
  let toolTipText = ''
  const iconStyle: CSSProperties = {
    position: 'absolute',
    bottom: '6px',
    right: '6px'
  }

  if (type) {
    switch (type) {
      case 'layer': {
        icon = <LayersIcon style={iconStyle} />
        toolTipText = t('Layer')

        break
      }
      case 'group': {
        icon = <SupervisorAccountIcon style={iconStyle} />
        toolTipText = t('Group')

        break
      }
      case 'story': {
        icon = <LibraryBooksIcon style={iconStyle} />
        toolTipText = t('Story')

        break
      }
      case 'map': {
        icon = <MapIcon style={iconStyle} />
        toolTipText = t('Map')

        break
      }
      // No default
    }
  }

  let addButton = <></>

  if (showAddButton) {
    addButton = (
      <a
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px'
        }}
      >
        <AddCircle
          style={{
            fontSize: '32px',
            color: 'red'
          }}
        />
      </a>
    )
  }

  let image

  if (type === 'story' && (!image_url || imageFailed)) {
    image = (
      <div
        className='card-image valign-wrapper'
        style={{
          width: '200px',
          height: '150px'
        }}
      >
        <LibraryBooksIcon
          className='omh-accent-text valign center-align'
          style={{
            fontSize: '80px',
            margin: 'auto'
          }}
        />
        {addButton}
      </div>
    )
  } else if (type === 'story' && image_url) {
    image = (
      <div
        style={{
          height: '150px',
          width: '200px',
          backgroundImage: 'url(' + image_url + ')',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {addButton}
      </div>
    )
  } else if (type === 'group' && (!image_url || imageFailed)) {
    image = (
      <div
        className='card-image valign-wrapper'
        style={{
          width: '200px',
          height: '150px'
        }}
      >
        <SupervisorAccountIcon
          className='omh-accent-text valign center-align'
          style={{
            fontSize: '80px',
            margin: 'auto'
          }}
        />
        {addButton}
      </div>
    )
  } else if (type === 'group' && image_url) {
    image = (
      <div className='card-image'>
        <img
          className='responsive-img'
          style={{
            height: '150px',
            width: 'auto',
            margin: 'auto'
          }}
          src={image_url}
          onError={() => {
            setImageFailed(true)
          }}
        />
        {addButton}
      </div>
    )
  } else if (type === 'layer' && (!image_url || imageFailed)) {
    image = (
      <div
        className='card-image valign-wrapper'
        style={{
          width: '200px',
          height: '150px'
        }}
      >
        <LayersIcon
          className='omh-accent-text valign center-align'
          style={{
            fontSize: '80px',
            margin: 'auto'
          }}
        />
        {addButton}
      </div>
    )
  } else if (type === 'map' && (!image_url || imageFailed)) {
    image = (
      <div
        className='card-image valign-wrapper'
        style={{
          width: '200px',
          height: '150px'
        }}
      >
        <MapIcon
          className='omh-accent-text valign center-align'
          style={{
            fontSize: '80px',
            margin: 'auto'
          }}
        />
        {addButton}
      </div>
    )
  } else {
    image = (
      <div className='card-image'>
        <img
          width='200'
          height='150'
          src={image_url}
          onError={() => {
            setImageFailed(true)
          }}
        />
        {addButton}
      </div>
    )
  }

  return (
    <Card
      hoverable
      style={{
        width: 200,
        height: 300
      }}
      onClick={() => {
        if (onClick) {
          onClick(data)
        } else if (link && typeof window !== 'undefined') {
          router.push(link)
        }
      }}
      bodyStyle={{
        height: '100%',
        padding: '0'
      }}
      id={id}
    >
      <style jsx global>
        {`
          .card-image {
            border-bottom: 1px solid #757575;
            display: flex;
          }
        `}
      </style>
      {image}
      <div
        className='card-content word-wrap'
        style={{
          height: '150x',
          padding: '5px'
        }}
      >
        <b>{t(title)}</b> <br />
        {showDescription && (
          <p
            className='fade'
            style={{
              fontSize: '12px'
            }}
          >
            {' '}
            {t(description)}
          </p>
        )}
        {group && (
          <div
            className='valign-wrapper'
            style={{
              position: 'absolute',
              bottom: 5,
              left: 5
            }}
          >
            <GroupTag group={group.group_id} />
          </div>
        )}
        {isPublic && (
          <div
            style={{
              position: 'absolute',
              bottom: '2px',
              right: '30px'
            }}
          >
            <Tooltip title={t('Public Sharing Enabled')} placement='top'>
              <LockOpen
                style={{
                  color: 'green'
                }}
              />
            </Tooltip>
          </div>
        )}
        {draft && (
          <>
            <div
              style={{
                position: 'absolute',
                top: '5px',
                right: '75px'
              }}
            >
              <span
                style={{
                  color: 'red',
                  fontWeight: 600
                }}
              >
                {t('DRAFT')}
              </span>
            </div>
            <div
              style={{
                position: 'absolute',
                bottom: '5px',
                right: '75px'
              }}
            >
              <span
                style={{
                  color: 'red',
                  fontWeight: 600
                }}
              >
                {t('DRAFT')}
              </span>
            </div>
          </>
        )}
        <Tooltip title={toolTipText} placement='top'>
          {icon}
        </Tooltip>
      </div>
    </Card>
  )
}
export default MapHubsCard
