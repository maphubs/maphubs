import React from 'react'
import { useRouter } from 'next/router'
import Layout from '../../src/components/Layout'
import { Row, Col, Button, Typography, Card } from 'antd'
import StorySummary from '../../src/components/Story/StorySummary'
import ErrorBoundary from '../../src/components/ErrorBoundary'
import FloatingAddButton from '../../src/components/FloatingAddButton'
import { Story } from '../../src/types/story'
import useT from '../../src/hooks/useT'
import useSWR from 'swr'
import useStickyResult from '../../src/hooks/useStickyResult'

const { Title } = Typography

const Stories = (): JSX.Element => {
  const { t } = useT()
  const router = useRouter()
  const { data } = useSWR(`
  {
    recentStories(limit: 25) {
      story_id
      title
      firstimage
      summary
      author
      owned_by_group_id
      groupname
      published
      published_at
    }
  }
  `)
  const stickyData: {
    recentStories: Story[]
    featuredStories: Story[]
  } = useStickyResult(data) || {}
  const { recentStories } = stickyData

  const hasRecent = recentStories && recentStories.length > 0
  return (
    <ErrorBoundary t={t}>
      <Layout title={t('Stories')} activePage='stories'>
        <Row
          style={{
            padding: '20px'
          }}
        >
          {hasRecent && (
            <Row
              justify='end'
              style={{
                textAlign: 'right'
              }}
            >
              <Button type='link' href='/stories/all'>
                {t('View All Stories')}
              </Button>
            </Row>
          )}
          {hasRecent && (
            <Col
              sm={24}
              md={12}
              style={{
                margin: '20px'
              }}
            >
              <Row
                justify='center'
                style={{
                  textAlign: 'center'
                }}
              >
                <Title level={2}>{t('Recent Stories')}</Title>
              </Row>
              {recentStories.map((story) => {
                return (
                  <Card
                    key={story.story_id}
                    style={{
                      maxWidth: '800px',
                      marginLeft: 'auto',
                      marginRight: 'auto',
                      marginBottom: '20px',
                      border: '1px solid #ddd'
                    }}
                  >
                    <StorySummary story={story} t={t} />
                  </Card>
                )
              })}
            </Col>
          )}

          {!hasRecent && (
            <Row
              style={{
                height: '400px',
                textAlign: 'center',
                paddingTop: '200px'
              }}
            >
              <b>{t('No Stories Found')}</b>
            </Row>
          )}
        </Row>
        <FloatingAddButton
          onClick={() => {
            router.push('/create/story')
          }}
          tooltip={t('Create New Story')}
        />
      </Layout>
    </ErrorBoundary>
  )
}
export default Stories
