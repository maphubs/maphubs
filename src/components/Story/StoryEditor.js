// @flow
import React from 'react'
import Formsy from 'formsy-react'
import slugify from 'slugify'
import dynamic from 'next/dynamic'
import { Row, Col, message, notification, Button, Popconfirm, Switch, DatePicker, Icon } from 'antd'
import AddMapDrawer from './AddMapDrawer'
import ImageCrop from '../ImageCrop'
import LocalizedInput from '../forms/ant/LocalizedInput'
import moment from 'moment'
import ErrorBoundary from '../ErrorBoundary'
import Tags from '../forms/ant/Tags'

import SelectGroup from '../Groups/SelectGroup'
import { subscribe } from '../../services/unstated-props'
import StoryContainer from './StoryContainer'
import $ from 'jquery'
import urlUtil from '@bit/kriscarle.maphubs-utils.maphubs-utils.url-util'

const StoryCKEditor = dynamic(() => import('./StoryCKEditor'), {
  ssr: false
})

type Props = {|
  myMaps: Array<Object>,
  popularMaps: Array<Object>,
  groups: Array<Object>,
  t: Function,
  locale: string,
  containers: any
|}

type State = {
  showAddMap: boolean,
  getMapCallback: Function,
  showImageCrop: boolean,
  imageData: any,
  imageCropCallback: Function
}

class StoryEditor extends React.Component<Props, State> {
  state = {
    showAddMap: false,
    showImageCrop: false,
    getMapCallback: () => {},
    imageCropCallback: () => {},
    imageData: ''
  }

  componentDidMount () {
    const _this = this
    const {t} = this.props
    window.addEventListener('beforeunload', (e) => {
      if (_this.props.containers.story.state.modified) {
        const msg = t('You have not saved the edits for your story, your changes will be lost.')
        e.returnValue = msg
        return msg
      }
    })
  }

  getFirstImage = () => {
    // attempt to find the first map or image
    let firstImg = null
    const firstEmbed = $('.ck-content').find('img, .ck-media__wrapper').first()
    if (firstEmbed.is('.ck-media__wrapper')) {
      // console.log(firstEmbed)
      const oembedURL = firstEmbed.attr('data-oembed-url')
      const parts = oembedURL.split('/')
      if (parts && parts.length >= 6 &&
        parts[3] === 'map' &&
        parts[4] === 'view') {
        const mapid = parts[5]
        firstImg = `${urlUtil.getBaseUrl()}/api/screenshot/map/${mapid}.png`
      }
      // console.log(parts)
    } else {
      firstImg = firstEmbed.attr('src')
    }
    return firstImg
  }

  save = async () => {
    const { t, containers } = this.props
    const { story } = containers
    const { title, author, body } = story.state

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

    const firstimage = this.getFirstImage()

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

  delete = async () => {
    const { t, containers } = this.props
    try {
      await containers.story.delete()
      message.info(t('Story Deleted'), 1, () => { window.location = '/' })
    } catch (err) {
      notification.error({
        message: t('Error'),
        description: err.message || err.toString() || err,
        duration: 0
      })
    }
  }

  showAddMap = () => {
    this.setState({showAddMap: true})
  }

  onAddMap = (map) => {
    // get the URL for the map
    const url = `${urlUtil.getBaseUrl()}/map/view/${map.map_id}/`
    this.setState({showAddMap: false})
    this.state.getMapCallback(url)
  }

  onSelectImage = (data: any) => {
    return new Promise((resolve, reject) => {
      message.info(this.props.t('Cropping Image'))
      this.setState({showImageCrop: true, imageCropCallback: resolve, imageData: data})
    })
  }

  onCrop = (dataURL: string, info: Object) => {
    message.info(this.props.t('Saving Image Crop'))
    // console.log(dataURL)
    // console.log(info)
    this.setState({showImageCrop: false, imageData: null})
    this.state.imageCropCallback(dataURL)
  }

  onMapCancel = () => {
    this.setState({showAddMap: false})
  }

  render () {
    const { save, onAddMap, onMapCancel, onSelectImage, onCrop } = this
    const { t, containers, myMaps, popularMaps, locale } = this.props
    const { showAddMap, showImageCrop, imageData } = this.state
    const { story } = containers
    const { story_id, title, author, body, summary, published, published_at, owned_by_group_id, modified, canChangeGroup } = story.state

    return (
      <Row style={{height: '100%'}}>
        <Col span={18} style={{height: '100%'}}>
          <ErrorBoundary>
            <StoryCKEditor
              initialData={body}
              onChange={story.bodyChange}
              cropImage={onSelectImage}
              onUploadImage={() => {
                message.info(t('Image Saved'))
              }}
              getMap={(cb) => {
                message.info(t('Selecting a Map'))
                this.setState({showAddMap: true, getMapCallback: cb})
              }}
            />
          </ErrorBoundary>
        </Col>
        <Col span={6} style={{padding: '10px'}}>
          <ErrorBoundary>
            <Row style={{textAlign: 'left', lineHeight: '32px', marginBottom: '10px'}}>
              <Col span={12}>
                <span style={{marginRight: '5px', fontWeight: 'bold', fontSize: '12px'}}>Draft</span>
                <Switch defaultChecked={published} onChange={story.togglePublished} />
                <span style={{marginLeft: '5px', fontWeight: 'bold', fontSize: '12px'}}>Published</span>
              </Col>
              <Col span={12} style={{textAlign: 'right'}}>
                <Button
                  type='primary' ghost disabled={modified} onClick={() => {
                    window.location = `/story/${slugify(title[locale])}/${story_id}`
                  }}
                >{t('View Story')}<Icon type='right' />
                </Button>
              </Col>
            </Row>
            <Row style={{marginBottom: '10px'}}>
              <p><b>Published Date</b></p>
              <DatePicker onChange={story.publishDateChange} defaultValue={moment(published_at)} format='YYYY-MM-DD' />
              <style jsx global>{`
                .ant-calendar-input {
                  background-color: #fff !important;
                  border: 0 !important;
                  border-bottom: none !important;
                  height: 22px  !important;
                  padding: 4px 11px !important;
                  margin: 0 !important;
                }
                .ant-calendar-picker-input {
                  height: 32px  !important;
                  font-size: 14px !important;
                }
              `}
              </style>
            </Row>
          </ErrorBoundary>
          <ErrorBoundary>
            <Row style={{marginBottom: '10px'}}>
              <Row style={{marginBottom: '10px'}}>
                <LocalizedInput value={title} placeholder='Title' onChange={story.titleChange} />
              </Row>
              <Row>
                <LocalizedInput value={author} placeholder='Author' onChange={story.authorChange} />
              </Row>
              <Row>
                <LocalizedInput type='area' value={summary} placeholder='Summary' onChange={story.summaryChange} />
              </Row>
            </Row>
          </ErrorBoundary>
          <ErrorBoundary>
            <Row style={{marginBottom: '10px'}}>
              <Formsy>
                <SelectGroup
                  groups={this.props.groups}
                  type='layer'
                  group_id={owned_by_group_id}
                  onGroupChange={story.groupChange}
                  canChangeGroup={canChangeGroup}
                />
              </Formsy>
            </Row>
            <Row style={{marginBottom: '20px'}}>
              <Tags initialTags={story.state.tags} onChange={story.tagsChange} />
            </Row>
          </ErrorBoundary>
          <Row type='flex' justify='start'>
            <Col span={12}>
              <Button
                type='primary'
                disabled={!modified}
                onClick={save}
              >{t('Save')}
              </Button>
            </Col>
            {story_id &&
              <Col span={12}>
                <Popconfirm
                  placement='top'
                  title={t('Delete this story?')}
                  okText='Yes' cancelText='No'
                  onConfirm={this.delete}
                >
                  <Button type='danger' icon='delete'>{t('Delete')}</Button>
                </Popconfirm>
              </Col>}
          </Row>
          <Row>
            {modified &&
              <span style={{marginRight: '10px'}}>Not Saved</span>}
          </Row>
        </Col>
        <AddMapDrawer
          visible={showAddMap}
          onAdd={onAddMap} onClose={onMapCancel}
          myMaps={myMaps} popularMaps={popularMaps} t={t}
        />
        <ImageCrop
          visible={showImageCrop}
          imageData={imageData}
          onCrop={onCrop}
          resize_max_width={1200}
        />
      </Row>
    )
  }
}

export default subscribe(StoryEditor, {
  story: StoryContainer
})
