import React from 'react'
import { useRouter } from 'next/router'
import Layout from '../../src/components/Layout'
import { Row, Button, Typography } from 'antd'
import CardCollection from '../../src/components/CardCarousel/CardCollection'
import CardSearch from '../../src/components/CardCarousel/CardSearch'
import cardUtil from '../../src/services/card-util'
import ErrorBoundary from '../../src/components/ErrorBoundary'
import FloatingAddButton from '../../src/components/FloatingAddButton'
import useT from '../../src/hooks/useT'
import useSWR from 'swr'
import useStickyResult from '../../src/hooks/useStickyResult'
import { Group } from '../../src/types/group'

const { Title } = Typography

const Groups = (): JSX.Element => {
  const { t } = useT()
  const router = useRouter()
  const { data } = useSWR(`
  {
    featuredGroups(limit: 25) {
      group_id
      name
      description
    }
    recentGroups(limit: 25) {
      group_id
      name
      description
    }
  }
  `)
  const stickyData: {
    featuredGroups: Group[]
    recentGroups: Group[]
  } = useStickyResult(data) || {}
  const { featuredGroups, recentGroups } = stickyData

  const featuredCards = featuredGroups
    ? featuredGroups.map((group) => cardUtil.getGroupCard(group))
    : []
  const recentCards = recentGroups
    ? recentGroups.map((group) => cardUtil.getGroupCard(group))
    : []
  return (
    <ErrorBoundary t={t}>
      <Layout title={t('Groups')} activePage='groups'>
        <div
          style={{
            margin: '10px'
          }}
        >
          <div
            style={{
              marginTop: '20px',
              marginBottom: '10px'
            }}
          >
            <Row>
              <Title level={2}>{t('Groups')}</Title>
            </Row>
          </div>
          <div>
            <CardSearch cardType='group' />
            {featuredCards.length > 0 && (
              <CardCollection
                title={t('Featured')}
                cards={featuredCards}
                viewAllLink='/groups/all'
              />
            )}
            <CardCollection
              title={t('Recent')}
              cards={recentCards}
              viewAllLink='/groups/all'
            />

            <FloatingAddButton
              onClick={() => {
                router.push('/creategroup')
              }}
              tooltip={t('Create New Group')}
            />
          </div>
          <Row
            justify='center'
            style={{
              marginBottom: '20px',
              textAlign: 'center'
            }}
          >
            <Button type='primary' href='/groups/all'>
              {t('View All Groups')}
            </Button>
          </Row>
        </div>
      </Layout>
    </ErrorBoundary>
  )
}
export default Groups
