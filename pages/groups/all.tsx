import React from 'react'
import { useRouter } from 'next/router'
import Layout from '../../src/components/Layout'
import { Row, Typography } from 'antd'
import CardSearch from '../../src/components/CardCarousel/CardSearch'
import GroupList from '../../src/components/Lists/GroupList'
import type { Group } from '../../src/types/group'
import ErrorBoundary from '../../src/components/ErrorBoundary'
import FloatingAddButton from '../../src/components/FloatingAddButton'
import useT from '../../src/hooks/useT'
import useSWR from 'swr'
import useStickyResult from '../../src/hooks/useStickyResult'

const { Title } = Typography
type Props = {
  groups: Group[]
}

const AllGroups = (): JSX.Element => {
  const { t, locale } = useT()
  const router = useRouter()
  const { data } = useSWR(`
  {
    groups(locale: "${locale}") {
      group_id
      name
      description
    }
  }
  `)
  const stickyData: {
    groups: Group[]
  } = useStickyResult(data) || {}
  const { groups } = stickyData
  return (
    <ErrorBoundary t={t}>
      <Layout title={t('Groups')} activePage='groups'>
        <div
          style={{
            margin: '10px'
          }}
        >
          <Row
            style={{
              marginTop: '20px',
              marginBottom: '10px'
            }}
          >
            <Title level={2}>{t('Groups')}</Title>
          </Row>
          <CardSearch cardType='group' />
          <Row
            justify='center'
            style={{
              marginBottom: '20px'
            }}
          >
            <GroupList showTitle={false} groups={groups} />
          </Row>
          <FloatingAddButton
            onClick={() => {
              router.push('/creategroup')
            }}
            tooltip={t('Create New Group')}
          />
        </div>
      </Layout>
    </ErrorBoundary>
  )
}
export default AllGroups
