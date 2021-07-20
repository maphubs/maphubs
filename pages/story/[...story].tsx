import React from 'react'
import { useRouter } from 'next/router'
import { Row, Col } from 'antd'
import Head from 'next/head'
import Layout from '../../src/components/Layout'
import Comments from '../../src/components/Comments'
import slugify from 'slugify'
import StoryHeader from '../../src/components/Story/StoryHeader'
import ShareButtons from '../../src/components/ShareButtons'
import ErrorBoundary from '../../src/components/ErrorBoundary'
import FloatingButton from '../../src/components/FloatingButton'
import Edit from '@material-ui/icons/Edit'
import getConfig from 'next/config'
import { Story } from '../../src/types/story'
import useT from '../../src/hooks/useT'
import useSWR from 'swr'
import useStickyResult from '../../src/hooks/useStickyResult'

const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig
type Props = {
  story: Story
  username: string
  canEdit: boolean
}
const StoryPage = (): JSX.Element => {
  const router = useRouter()
  const { t } = useT()
  const slug = router.query.story || []
  const id = slug[0]
  // FIXME: Embeddly support
  /*
    for (const element of document.querySelectorAll('oembed[url]')) {
      // Create the <a href="..." class="embedly-card"></a> element that Embedly uses
      // to discover the media.
      const anchor = document.createElement('a')
      anchor.setAttribute('href', element.getAttribute('url'))
      anchor.className = 'embedly-card'
      element.append(anchor)
    }
    */
  const { data } = useSWR([
    `
    {
      story(id: "{id}") {
        story_id
        title
        body
        author
        owned_by_group_id
        groupname
        published_at
      }
      allowedToModifyStory(id: "{id}")
    }
    `,
    id
  ])
  const stickyData: {
    story: Story
    allowedToModifyStory: boolean
  } = useStickyResult(data) || {}
  const { story, allowedToModifyStory } = stickyData

  let shareAndDiscuss = <></>

  if (MAPHUBS_CONFIG.enableComments) {
    shareAndDiscuss = (
      <div className='story-share-comments'>
        <Row
          style={{
            height: '32px',
            position: 'relative',
            marginBottom: '25px'
          }}
        >
          <ShareButtons
            title={story.title}
            style={{
              position: 'absolute',
              left: '0px'
            }}
          />
        </Row>
        <Row>
          <ErrorBoundary t={t}>
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
        <script
          async
          charSet='utf-8'
          src='//cdn.embedly.com/widgets/platform.js'
        />
      </Head>
      <ErrorBoundary t={t}>
        <Layout title={t('')}>
          <div className='container'>
            <Row
              style={{
                marginTop: '20px'
              }}
            >
              <Col flex='auto'>
                <StoryHeader story={story} />
              </Col>
              <Col
                flex='0 1 125px'
                style={{
                  textAlign: 'right'
                }}
              >
                <ShareButtons title={story.title} />
              </Col>
            </Row>
            <Row
              style={{
                width: '100%'
              }}
            >
              <h1 className='story-title'>{t(story.title)}</h1>
              <div
                className='story-content'
                dangerouslySetInnerHTML={{
                  __html: t(story.body)
                }}
              />
            </Row>
            <hr />
            {shareAndDiscuss}
          </div>
          {allowedToModifyStory && (
            <FloatingButton
              onClick={() => {
                window.location.assign(
                  `/story/edit/${story.story_id}/${slugify(t(story.title))}`
                )
              }}
              tooltip={t('Edit')}
              icon={<Edit />}
            />
          )}
          <style jsx global>
            {`
              body {
                font-family: 'Roboto', sans-serif !important;
                color: #323333;
              }

              .story-content {
                width: 100%;
                font-family: -apple-system, BlinkMacSystemFont, Roboto,
                  'Open Sans', sans-serif;
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
              .story-content table th {
                border: 1px solid #323333;
                padding-left: 5px;
                background-color: #d9d9d9;
              }
              .story-content table td {
                border: 1px solid #d9d9d9;
                padding-left: 5px;
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
        </Layout>
      </ErrorBoundary>
    </>
  )
  /* eslint-enable react/no-danger */
}
export default StoryPage
