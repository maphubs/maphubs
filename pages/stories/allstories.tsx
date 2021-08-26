import React from 'react'
import { useRouter } from 'next/router'
import { Row, Typography } from 'antd'
import Layout from '../../src/components/Layout'
import StoryList from '../../src/components/Lists/StoryList'
import ErrorBoundary from '../../src/components/ErrorBoundary'
import FloatingAddButton from '../../src/components/FloatingAddButton'
import useT from '../../src/hooks/useT'
import { Story } from '../../src/types/story'
import useSWR from 'swr'
import useStickyResult from '../../src/hooks/useStickyResult'

const { Title } = Typography

const AllStories = (): JSX.Element => {
  const { t } = useT()
  const router = useRouter()
  const { data } = useSWR(`
  {
    stories {
      story_id
      title
    }
  }
  `)
  const stickyData: {
    stories: Story[]
  } = useStickyResult(data) || {}
  const { stories } = stickyData
  const hasStories = stories && stories.length > 0
  return (
    <ErrorBoundary t={t}>
      <Layout title={t('Stories')} activePage='stories'>
        <div
          style={{
            padding: '10px'
          }}
        >
          <div
            style={{
              marginTop: '20px',
              marginBottom: '10px'
            }}
          >
            <Row>
              <Title>{t('Stories')}</Title>
            </Row>
            {hasStories && (
              <Row>
                <div className='container'>
                  <StoryList stories={stories} />
                </div>
              </Row>
            )}
            {!hasStories && (
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
          </div>
          <FloatingAddButton
            onClick={() => {
              router.push('/create/story')
            }}
            tooltip={t('Create New Story')}
          />
        </div>
      </Layout>
    </ErrorBoundary>
  )
}
export default AllStories
