import React from 'react'
import { useRouter } from 'next/router'
import Layout from '../../src/components/Layout'
import { Row, Col, Button, Typography } from 'antd'
import LayerList from '../../src/components/Lists/LayerList'
import type { Layer } from '../../src/types/layer'
import ErrorBoundary from '../../src/components/ErrorBoundary'
import useSWR from 'swr'
import useStickyResult from '../../src/hooks/useStickyResult'
import { Group } from '../../src/types/group'
import useT from '../../src/hooks/useT'

const { Title } = Typography

const AllLayers = (): JSX.Element => {
  const { t, locale } = useT()
  const router = useRouter()
  const { data } = useSWR(`
  {
    layers(locale: "${locale}") {
      layer_id
      name
      owned_by_group_id
    }
    groups(locale: "${locale}") {
      group_id
      name
    }
  }
  `)
  const stickyData: {
    layers: Layer[]
    groups: Group[]
  } = useStickyResult(data) || {}
  const { layers, groups } = stickyData
  return (
    <ErrorBoundary t={t}>
      <Layout title={t('Layer')} activePage='layers'>
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
              <Title level={2}>{t('Layers')}</Title>
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
                  router.push('/createlayer')
                }}
              >
                {t('Create New Layer')}
              </Button>
            </Col>
          </Row>
          <Row
            style={{
              width: '100%',
              height: 'calc(100vh - 150px)'
            }}
          >
            <LayerList layers={layers} groups={groups} />
          </Row>
        </div>
      </Layout>
    </ErrorBoundary>
  )
}
export default AllLayers
