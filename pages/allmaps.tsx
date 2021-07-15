import React from 'react'
import Layout from '../src/components/Layout'
import { Row, Col, Button, Typography } from 'antd'
import MapList from '../src/components/Lists/MapList'
import ErrorBoundary from '../src/components/ErrorBoundary'
import { Group } from '../src/types/group'
import useT from '../src/hooks/useT'
const { Title } = Typography
type Props = {
  maps: Array<Record<string, any>>
  groups: Group[]
}
const AllMaps = () => {
  const { t } = useT()
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
                  window.location.assign('/map/new')
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
export default
