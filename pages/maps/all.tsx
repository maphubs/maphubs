import React from 'react'
import { useRouter } from 'next/router'
import Layout from '../../src/components/Layout'
import { Row, Col, Button, Typography } from 'antd'
import MapList from '../../src/components/Lists/MapList'
import ErrorBoundary from '../../src/components/ErrorBoundary'
import { Group } from '../../src/types/group'
import useT from '../../src/hooks/useT'
import useSWR from 'swr'
import useStickyResult from '../../src/hooks/useStickyResult'
import { Map } from '../../src/types/map'

const { Title } = Typography

const AllMaps = (): JSX.Element => {
  const { t, locale } = useT()
  const router = useRouter()
  const { data } = useSWR(`
  {
    maps(locale: "${locale}") {
      map_id
      title
      updated_at
      owned_by_group_id
    }
    groups(locale: "${locale}") {
      group_id
      name
    }
  }
  `)
  const stickyData: {
    maps: Map[]
    groups: Group[]
  } = useStickyResult(data) || {}
  const { maps, groups } = stickyData
  return (
    <ErrorBoundary t={t}>
      <Layout title={t('Maps')} activePage='maps'>
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
            <Col span={8}>
              <Title level={2}>{t('Maps')}</Title>
            </Col>
            <Col
              span={8}
              offset={8}
              style={{
                textAlign: 'right'
              }}
            >
              <Button
                onClick={() => {
                  router.push('/map/new')
                }}
              >
                {t('Create New Map')}
              </Button>
            </Col>
          </Row>
          <Row
            style={{
              width: '100%',
              height: 'calc(100vh - 150px)'
            }}
          >
            <MapList maps={maps} groups={groups} />
          </Row>
        </div>
      </Layout>
    </ErrorBoundary>
  )
}
export default AllMaps
