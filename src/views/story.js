// @flow
import React from 'react'
import { Row, Col } from 'antd'
import Header from '../components/header'
import Comments from '../components/Comments'
import slugify from 'slugify'
import StoryHeader from '../components/Story/StoryHeader'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import ShareButtons from '../components/ShareButtons'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'
import FloatingButton from '../components/FloatingButton'
import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig

type Props = {
  story: Object,
  username: string,
  canEdit: boolean,
  locale: string,
  _csrf: string,
  headerConfig: Object,
  user: Object
}

export default class Story extends MapHubsComponent<Props, void> {
  static async getInitialProps ({ req, query }: {req: any, query: Object}) {
    const isServer = !!req

    if (isServer) {
      return query.props
    } else {
      console.error('getInitialProps called on client')
    }
  }

  static defaultProps = {
    story: {},
    canEdit: false
  }

  constructor (props: Props) {
    super(props)
    Reflux.rehydrate(LocaleStore, {locale: props.locale, _csrf: props._csrf})
    if (props.user) {
      Reflux.rehydrate(UserStore, {user: props.user})
    }
  }

  render () {
    const {t} = this
    const story = this.props.story

    let button = ''
    if (this.props.canEdit) {
      button = (
        <div className='fixed-action-btn action-button-bottom-right'>
          <FloatingButton
            href={`/editstory/${this.props.story.story_id}/${slugify(t(this.props.story.title))}`}
            tooltip={t('Edit')}
            tooltipPosition='left'
            icon='mode_edit' />
        </div>
      )
    }

    let shareAndDiscuss = ''
    if (MAPHUBS_CONFIG.enableComments) {
      shareAndDiscuss = (
        <div className='story-share-comments'>
          <Row style={{height: '32px', position: 'relative'}}>
            <ShareButtons
              title={t(story.title)} t={t}
              style={{width: '70px', position: 'absolute', left: '0px'}}
            />
          </Row>
          <Row>
            <ErrorBoundary>
              <Comments />
            </ErrorBoundary>
          </Row>
        </div>
      )
    }

    /* eslint-disable react/no-danger */
    return (
      <ErrorBoundary>
        <Header {...this.props.headerConfig} />
        <main>
          <div className='container'>
            <Row style={{marginTop: '20px'}}>
              <Col md={18} sm={24}>
                <StoryHeader story={story} />
              </Col>
              <Col md={6} sm={24}>
                <ShareButtons
                  title={t(story.title)} t={t}
                  style={{width: '70px', position: 'absolute', right: '10px'}}
                />
              </Col>
            </Row>
            <Row>
              <h3 className='story-title'>{t(story.title)}</h3>
              <div className='story-content' dangerouslySetInnerHTML={{__html: t(story.body)}} />
            </Row>
            <hr />
            {shareAndDiscuss}
          </div>
          {button}
          <style jsx global>{`
            body {
              font-family: 'Roboto', sans-serif !important;
              color: #323333;
            }
            
            .story-content table {
              width: 80%;
              margin: auto auto;
            }
            .story-content table th{
              border:1px solid #323333;
              padding-left: 5px;
              background-color: #d9d9d9;
            }
            .story-content table td{
              border:1px solid #d9d9d9;
              padding-left:5px;
            }
            
          `}</style>
        </main>
      </ErrorBoundary>
    )
    /* eslint-enable react/no-danger */
  }
}
