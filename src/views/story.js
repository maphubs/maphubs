// @flow
import React from 'react'
import { Row, Col } from 'antd'
import Head from 'next/head'
import Header from '../components/header'
import Footer from '../components/footer'
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
import Edit from '@material-ui/icons/Edit'
import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig

type Props = {
  story: Object,
  username: string,
  canEdit: boolean,
  locale: string,
  _csrf: string,
  headerConfig: Object,
  footerConfig: Object,
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

  componentDidMount () {
    document.querySelectorAll('oembed[url]').forEach(element => {
      // Create the <a href="..." class="embedly-card"></a> element that Embedly uses
      // to discover the media.
      const anchor = document.createElement('a')

      anchor.setAttribute('href', element.getAttribute('url'))
      anchor.className = 'embedly-card'

      element.append(anchor)
    })
  }

  render () {
    const {t} = this
    const { story, canEdit } = this.props

    let shareAndDiscuss = ''
    if (MAPHUBS_CONFIG.enableComments) {
      shareAndDiscuss = (
        <div className='story-share-comments'>
          <Row style={{height: '32px', position: 'relative', marginBottom: '25px'}}>
            <ShareButtons
              title={t(story.title)} t={t}
              style={{position: 'absolute', left: '0px'}}
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
      <>
        <Head>
          <script async charSet='utf-8' src='//cdn.embedly.com/widgets/platform.js' />
        </Head>
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
                    style={{position: 'absolute', right: '10px'}}
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
            {canEdit &&
              <FloatingButton
                onClick={() => {
                  window.location = `/editstory/${this.props.story.story_id}/${slugify(t(this.props.story.title))}`
                }}
                tooltip={t('Edit')}
                icon={<Edit />}
              />}
            <style jsx global>{`
              body {
                font-family: 'Roboto', sans-serif !important;
                color: #323333;
              }

              .story-content p {
                font-size: 20px;
              }
              .story-content ul {
                list-style: initial;
                font-size: 20px;
                padding-left: 40px;
              }
              .story-content ul li {
                list-style-type: inherit;
              }
              .story-content ol {
                font-size: 20px;
              }
              .story-content a {
                color: ${MAPHUBS_CONFIG.primaryColor};
                text-decoration: underline;
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

              .story-content blockquote {
                overflow: hidden;
                padding-right: 1.5em;
                padding-left: 1.5em;
                margin-left: 0;
                font-style: italic;
                border-left: 5px solid #ccc;
              }
            
              .image {
                text-align: center;
              }

              .image img {
                max-width: 100%;
              }

              .image-style-side {
                float: right;
              }
              
            `}
            </style>
          </main>
          <Footer t={t} {...this.props.footerConfig} />
        </ErrorBoundary>
      </>
    )
    /* eslint-enable react/no-danger */
  }
}
