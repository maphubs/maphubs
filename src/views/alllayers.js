// @flow
import React from 'react'
import Header from '../components/header'
import Footer from '../components/footer'
import { Row, Typography } from 'antd'
import CardSearch from '../components/CardCarousel/CardSearch'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import LayerList from '../components/Lists/LayerList'
import type {Layer} from '../types/layer'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'
import FloatingAddButton from '../components/FloatingAddButton'

const { Title } = Typography

type Props = {
  layers: Array<Layer>,
  locale: string,
  footerConfig: Object,
  headerConfig: Object,
  _csrf: string,
  user: Object
}

export default class Layers extends MapHubsComponent<Props, void> {
  static async getInitialProps ({ req, query }: {req: any, query: Object}) {
    return query.props
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
    const { layers } = this.props

    return (
      <ErrorBoundary>
        <Header activePage='layers' {...this.props.headerConfig} />
        <main style={{margin: '10px'}}>
          <Row style={{marginTop: '20px', marginBottom: '10px'}}>
            <Title level={2}>{t('Layers')}</Title>
          </Row>
          <CardSearch cardType='layer' t={t} />
          <Row justify='center'>
            <LayerList showTitle={false} layers={layers} t={t} />
          </Row>
          <FloatingAddButton
            onClick={() => {
              window.location = '/createlayer'
            }}
            tooltip={t('Create New Layer')}
          />
        </main>
        <Footer t={t} {...this.props.footerConfig} />
      </ErrorBoundary>
    )
  }
}
