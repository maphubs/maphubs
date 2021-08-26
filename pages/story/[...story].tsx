import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/client'
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
import urlUtil from '@bit/kriscarle.maphubs-utils.maphubs-utils.url-util'

import { Story } from '../../src/types/story'
import useT from '../../src/hooks/useT'
import { NextSeo } from 'next-seo'

//SSR only
import StoryModel from '../../src/models/story'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'

type Props = {
  story: Story
  allowedToModifyStory: boolean
  coral_jwt?: string
}

// use SSR for stories for SEO
export const getServerSideProps: GetServerSideProps = async (context) => {
  const story_id = Number.parseInt(context.params.story[1])
  const story = await StoryModel.getStoryById(story_id)
  const session = await getSession(context)
  let allowedToModifyStory
  if (session?.user) {
    allowedToModifyStory = await StoryModel.allowedToModify(
      story_id,
      session.user.id || session.user.sub
    )
  }
  if (!story) {
    return {
      notFound: true
    }
  }

  // add Coral Talk jwt
  let coral_jwt
  if (process.env.CORAL_TALK_SECRET) {
    const token = jwt.sign(
      {
        user: {
          id: session.user.id,
          email: session.user.email,
          username: undefined
        }
      },
      process.env.CORAL_TALK_SECRET,
      {
        jwtid: uuidv4(),
        expiresIn: '24h'
      }
    )
    coral_jwt = token
  }

  return {
    props: {
      story,
      allowedToModifyStory,
      coral_jwt
    }
  }
}

const StoryPage = ({
  story,
  allowedToModifyStory,
  coral_jwt
}: Props): JSX.Element => {
  const router = useRouter()
  const { t } = useT()

  useEffect(() => {
    for (const element of document.querySelectorAll('oembed[url]')) {
      // Create the <a href="..." class="embedly-card"></a> element that Embedly uses
      // to discover the media.
      const anchor = document.createElement('a')
      anchor.setAttribute('href', element.getAttribute('url'))
      anchor.className = 'embedly-card'
      element.append(anchor)
    }
  }, [])

  let shareAndDiscuss = <></>

  if (process.env.NEXT_PUBLIC_ENABLE_COMMENTS) {
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
            <Comments coral_jwt={coral_jwt} />
          </ErrorBoundary>
        </Row>
      </div>
    )
  }

  const baseUrl = urlUtil.getBaseUrl()
  const canonical = `${baseUrl}/story/${t(story.title)}/${t(story.story_id)}`

  let imageUrl = ''

  if (story.firstimage) {
    imageUrl = urlUtil.getBaseUrl() + story.firstimage
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
      <NextSeo
        title={t(story.title)}
        description={story.summary ? t(story.summary) : t(story.title)}
        canonical={canonical}
        openGraph={{
          url: canonical,
          title: t(story.title),
          description: story.summary ? t(story.summary) : t(story.title),
          images: [
            {
              url: imageUrl,
              alt: t(story.title)
            }
          ],
          site_name: process.env.NEXT_PUBLIC_PRODUCT_NAME
        }}
        twitter={{
          handle: process.env.NEXT_PUBLIC_TWITTER,
          site: process.env.NEXT_PUBLIC_TWITTER,
          cardType: 'summary'
        }}
      />
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
                router.push(
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
                color: ${process.env.NEXT_PUBLIC_PRIMARY_COLOR};
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
