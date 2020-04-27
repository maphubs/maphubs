// @flow
import React from 'react'
import Header from '../src/components/header'
import Footer from '../src/components/footer'
import { Row, Col, Button, Typography } from 'antd'
import MapHubsComponent from '../src/components/MapHubsComponent'
import Reflux from '../src/components/Rehydrate'
import LocaleStore from '../src/stores/LocaleStore'
import MapList from '../src/components/Lists/MapList'
import ErrorBoundary from '../src/components/ErrorBoundary'
import UserStore from '../src/stores/UserStore'

const { Title } = Typography

type Props = {
  maps: Array<Object>,
  groups: Array<Object>,
  locale: string,
  _csrf: string,
  footerConfig: Object,
  headerConfig: Object,
  user: Object
}

export default class AllMaps extends MapHubsComponent<Props, void> {
  static async getInitialProps ({ req, query }: {req: any, query: Object}) {
    const isServer = !!req

    if (isServer) {
      return query.props
    } else {
      console.error('getInitialProps called on client')
    }
  }

  constructor (props: Props) {
    super(props)
    Reflux.rehydrate(LocaleStore, {locale: props.locale, _csrf: props._csrf})
    if (props.user) {
      Reflux.rehydrate(UserStore, {user: props.user})
    }
  }

  render () {
    const {t} = this
    const { maps, groups } = this.props

    return (
      <ErrorBoundary>
        <Header activePage='maps' {...this.props.headerConfig} />
        <main style={{margin: '10px'}}>
          <Row style={{marginTop: '20px', marginBottom: '10px'}}>
            <Col span={8}>
              <Title level={2}>{t('Maps')}</Title>
            </Col>
            <Col span={8} offset={8} style={{textAlign: 'right'}}>
              <Button onClick={() => {
                window.location = '/map/new'
              }}
              >{t('Create New Map')}
              </Button>
            </Col>
          </Row>
          <Row style={{width: '100%', height: 'calc(100vh - 150px)'}}>
            <MapList maps={maps} groups={groups} t={t} />
          </Row>
        </main>
        <Footer t={t} {...this.props.footerConfig} />
      </ErrorBoundary>
    )
  }
}
