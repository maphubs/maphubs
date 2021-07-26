import React from 'react'
import { useRouter } from 'next/router'
import { Row, Result, Button, Typography } from 'antd'
import MapIcon from '@material-ui/icons/Map'
import Layout from '../../src/components/Layout'
import CardCarousel from '../../src/components/CardCarousel/CardCarousel'
import cardUtil from '../../src/services/card-util'
import ErrorBoundary from '../../src/components/ErrorBoundary'
import FloatingButton from '../../src/components/FloatingButton'

import useT from '../../src/hooks/useT'
import useSWR from 'swr'
import useStickyResult from '../../src/hooks/useStickyResult'
import { Map } from '../../src/types/map'

const { Title } = Typography

type Props = {
  myMaps: Map[]
}
const UserMaps = (): JSX.Element => {
  const { t } = useT()
  const router = useRouter()
  const { data } = useSWR(`
  {
    myMaps {
      map_id
      title
      updated_at
      owned_by_group_id
    }
  }
  `)
  const stickyData: {
    myMaps: Map[]
  } = useStickyResult(data) || {}
  const { myMaps } = stickyData

  return (
    <ErrorBoundary t={t}>
      <Layout title={t('My Maps')}>
        <div
          style={{
            height: 'calc(100% - 70px)',
            padding: '10px'
          }}
        >
          {(!myMaps || myMaps.length === 0) && (
            <Row
              style={{
                height: 'calc(100% - 100px)',
                marginBottom: '20px'
              }}
            >
              <Result
                style={{
                  margin: 'auto'
                }}
                icon={
                  <MapIcon
                    style={{
                      color: process.env.NEXT_PUBLIC_PRIMARY_COLOR,
                      fontSize: '72px'
                    }}
                  />
                }
                title={t('Click the button below to create your first map')}
                extra={
                  <Button type='primary' href='/map/new'>
                    {t('Create a Map')}
                  </Button>
                }
              />
            </Row>
          )}
          {myMaps && myMaps.length > 0 && (
            <Row
              style={{
                marginBottom: '20px'
              }}
            >
              <Title level={2}>{t('My Maps')}</Title>
              <CardCarousel
                cards={myMaps.map((map) => cardUtil.getMapCard(map))}
              />
            </Row>
          )}

          <FloatingButton
            onClick={() => {
              router.push('/map/new')
            }}
            tooltip={t('Create New Map')}
          />
        </div>
      </Layout>
    </ErrorBoundary>
  )
}
export default UserMaps
