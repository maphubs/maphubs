import React from 'react'
import Header from '../src/components/header'
import Footer from '../src/components/footer'
import { Row, Col, Button, Typography } from 'antd'
import MapList from '../src/components/Lists/MapList'
import ErrorBoundary from '../src/components/ErrorBoundary'
import { Group } from '../src/types/group'

const { Title } = Typography
type Props = {
  maps: Array<Record<string, any>>
  groups: Group[]
  locale: string
  _csrf: string
  footerConfig: Record<string, any>
  headerConfig: Record<string, any>
  user: Record<string, any>
}
export default class AllMaps extends React.Component<Props> {
  static async getInitialProps({
    req,
    query
  }: {
    req: any
    query: Record<string, any>
  }): Promise<any> {
    const isServer = !!req

    if (isServer) {
      return query.props
    } else {
      console.error('getInitialProps called on client')
    }
  }

  render(): JSX.Element {
    const { t, props } = this
    const { maps, groups, headerConfig, footerConfig } = props
    return (
      <ErrorBoundary t={t}>
        <Header activePage='maps' {...headerConfig} />
        <main
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
        </main>
        <Footer t={t} {...footerConfig} />
      </ErrorBoundary>
    )
  }
}
