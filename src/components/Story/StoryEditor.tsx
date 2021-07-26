import React, { useState } from 'react'
import { useRouter } from 'next/router'
import Formsy from 'formsy-react'
import slugify from 'slugify'
import dynamic from 'next/dynamic'
import { DeleteOutlined, RightOutlined } from '@ant-design/icons'
import {
  Row,
  Col,
  message,
  notification,
  Button,
  Popconfirm,
  Switch,
  DatePicker
} from 'antd'
import AddMapDrawer from './AddMapDrawer'
import ImageCrop from '../ImageCrop'
import LocalizedInput from '../forms/ant/LocalizedInput'
import moment from 'moment'
import ErrorBoundary from '../ErrorBoundary'
import Tags from '../forms/ant/Tags'
import SelectGroup from '../Groups/SelectGroup'
import $ from 'jquery'
import urlUtil from '@bit/kriscarle.maphubs-utils.maphubs-utils.url-util'
import useT from '../../hooks/useT'
import useUnload from '../../hooks/useUnload'
import { Map } from '../../types/map'
import { Group } from '../../types/group'
const StoryCKEditor = dynamic(() => import('./StoryCKEditor'), {
  ssr: false
})
type Props = {
  myMaps: Map[]
  recentMaps: Map[]
  groups: Group[]
}

type ImageCropState = {
  imageData: string
  imageCropCallback: (imageData: string) => void
}

const StoryEditor = ({ myMaps, recentMaps, groups }: Props): JSX.Element => {
  const { t, locale } = useT()
  const router = useRouter()
  const [showAddMap, setShowAddMap] = useState(false)
  const [showImageCrop, setShowImageCrop] = useState(false)
  const [imageCropState, setImageCropState] = useState<ImageCropState>({
    imageData: '',
    imageCropCallback: () => {}
  })
  const [getMapCallback, setGetMapCallback] = useState<(url: string) => void>(
    () => {}
  )

  useUnload((e) => {
    e.preventDefault()
    if (storyState.modified) {
      const exit = confirm(t('Any pending changes will be lost'))
      if (exit) window.close()
    }
    window.close()
  })

  const getFirstImage = () => {
    // attempt to find the first map or image
    let firstImg
    const firstEmbed = $('.ck-content').find('img, .ck-media__wrapper').first()

    if (firstEmbed.is('.ck-media__wrapper')) {
      // console.log(firstEmbed)
      const oembedURL = firstEmbed.attr('data-oembed-url')
      const parts = oembedURL.split('/')

      if (
        parts &&
        parts.length >= 6 &&
        parts[3] === 'map' &&
        parts[4] === 'view'
      ) {
        const mapid = parts[5]
        firstImg = `${urlUtil.getBaseUrl()}/api/screenshot/map/${mapid}.png`
      } // console.log(parts)
    } else {
      firstImg = firstEmbed.attr('src')
    }

    return firstImg
  }
  const save = async () => {
    const { title, author, body } = storyState

    if (!title) {
      message.warning(t('Please add a title'), 5)
      return
    }

    if (!author) {
      message.warning(t('Please add an author'), 5)
      return
    }

    if (!body) {
      message.warning(t('Please add the story body'), 5)
      return
    }

    const firstimage = getFirstImage()
    const closeSavingMessage = message.loading(t('Saving'), 0)

    try {
      await story.save(firstimage)
      closeSavingMessage()
      message.info(t('Story Saved'))
      story.setModified(false)
    } catch (err) {
      closeSavingMessage()
      notification.error({
        message: t('Error'),
        description: err.message || err.toString() || err,
        duration: 0
      })
    }
  }
  const deleteStory = async () => {
    try {
      await story.delete()
      message.info(t('Story Deleted'), 1, () => {
        router.push('/')
      })
    } catch (err) {
      notification.error({
        message: t('Error'),
        description: err.message || err.toString() || err,
        duration: 0
      })
    }
  }

  const onAddMap = (map) => {
    // get the URL for the map
    const url = `${urlUtil.getBaseUrl()}/map/view/${map.map_id}/`
    setShowAddMap(false)
    getMapCallback(url)
  }

  const onSelectImage = async (data: any) => {
    return new Promise((resolve, reject) => {
      message.info(t('Cropping Image'))

      setImageCropState({
        imageCropCallback: resolve,
        imageData: data
      })
      setShowImageCrop(true)
    })
  }
  const onCrop = (dataURL: string, info: Record<string, any>) => {
    message.info(t('Saving Image Crop'))
    setImageCropState({ imageData: '', imageCropCallback: () => {} })
    setShowImageCrop(false)
    imageCropState.imageCropCallback(dataURL)
  }

  const onMapCancel = () => {
    setShowAddMap(false)
  }

  const { imageData } = imageCropState
  const {
    story_id,
    title,
    author,
    body,
    summary,
    published,
    published_at,
    owned_by_group_id,
    modified,
    canChangeGroup,
    tags
  } = storyState
  return (
    <Row
      style={{
        height: '100%'
      }}
    >
      <Col
        span={18}
        style={{
          height: '100%'
        }}
      >
        <ErrorBoundary t={t}>
          <StoryCKEditor
            initialData={body}
            onChange={story.bodyChange}
            cropImage={onSelectImage}
            onUploadImage={() => {
              message.info(t('Image Saved'))
            }}
            getMap={(cb) => {
              message.info(t('Selecting a Map'))
              setGetMapCallback(cb)
              setShowAddMap(true)
            }}
          />
        </ErrorBoundary>
      </Col>
      <Col
        span={6}
        style={{
          padding: '10px'
        }}
      >
        <ErrorBoundary t={t}>
          <Row
            style={{
              textAlign: 'left',
              lineHeight: '32px',
              marginBottom: '10px'
            }}
          >
            <Col span={12}>
              <span
                style={{
                  marginRight: '5px',
                  fontWeight: 'bold',
                  fontSize: '12px'
                }}
              >
                Draft
              </span>
              <Switch
                defaultChecked={published}
                onChange={story.togglePublished}
              />
              <span
                style={{
                  marginLeft: '5px',
                  fontWeight: 'bold',
                  fontSize: '12px'
                }}
              >
                Published
              </span>
            </Col>
            <Col
              span={12}
              style={{
                textAlign: 'right'
              }}
            >
              <Button
                type='primary'
                ghost
                disabled={modified}
                onClick={() => {
                  router.push(`/story/${slugify(title[locale])}/${story_id}`)
                }}
              >
                {t('View Story')}
                <RightOutlined />
              </Button>
            </Col>
          </Row>
          <Row
            style={{
              marginBottom: '10px'
            }}
          >
            <p>
              <b>Published Date</b>
            </p>
            <DatePicker
              onChange={story.publishDateChange}
              defaultValue={moment(published_at)}
              format='YYYY-MM-DD'
            />
            <style jsx global>
              {`
                .ant-calendar-input {
                  background-color: #fff !important;
                  border: 0 !important;
                  border-bottom: none !important;
                  height: 22px !important;
                  padding: 4px 11px !important;
                  margin: 0 !important;
                }
                .ant-calendar-picker-input {
                  height: 32px !important;
                  font-size: 14px !important;
                }
              `}
            </style>
          </Row>
        </ErrorBoundary>
        <ErrorBoundary t={t}>
          <Row
            style={{
              marginBottom: '10px'
            }}
          >
            <Row
              style={{
                marginBottom: '10px'
              }}
            >
              <LocalizedInput
                initialValue={title}
                placeholder='Title'
                onChange={story.titleChange}
              />
            </Row>
            <Row>
              <LocalizedInput
                initialValue={author}
                placeholder='Author'
                onChange={story.authorChange}
              />
            </Row>
            <Row>
              <LocalizedInput
                type='area'
                initialValue={summary}
                placeholder='Summary'
                onChange={story.summaryChange}
              />
            </Row>
          </Row>
        </ErrorBoundary>
        <ErrorBoundary t={t}>
          <Row
            style={{
              marginBottom: '10px'
            }}
          >
            <Formsy
              style={{
                width: '100%'
              }}
            >
              <SelectGroup
                groups={groups}
                group_id={owned_by_group_id}
                onGroupChange={story.groupChange}
                canChangeGroup={canChangeGroup}
              />
            </Formsy>
          </Row>
          <Row
            style={{
              marginBottom: '20px'
            }}
          >
            <Tags initialTags={tags} onChange={story.tagsChange} />
          </Row>
        </ErrorBoundary>
        <Row justify='start'>
          <Col span={12}>
            <Button type='primary' disabled={!modified} onClick={save}>
              {t('Save')}
            </Button>
          </Col>
          {story_id && (
            <Col span={12}>
              <Popconfirm
                placement='top'
                title={t('Delete this story?')}
                okText='Yes'
                cancelText='No'
                onConfirm={deleteStory}
              >
                <Button danger icon={<DeleteOutlined />}>
                  {t('Delete')}
                </Button>
              </Popconfirm>
            </Col>
          )}
        </Row>
        <Row>
          {modified && (
            <span
              style={{
                marginRight: '10px'
              }}
            >
              Not Saved
            </span>
          )}
        </Row>
      </Col>
      <AddMapDrawer
        visible={showAddMap}
        onAdd={onAddMap}
        onClose={() => {
          setShowAddMap(false)
        }}
        myMaps={myMaps}
        recentMaps={recentMaps}
      />
      <ImageCrop
        visible={showImageCrop}
        onCancel={() => {
          setShowImageCrop(false)
        }}
        imageData={imageData}
        onCrop={onCrop}
        resize_max_width={1200}
      />
    </Row>
  )
}
export default StoryEditor
