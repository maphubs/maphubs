// @flow
import React from 'react'
import Header from '../src/components/header'
import Footer from '../src/components/footer'
import { Row, Typography } from 'antd'
import CardSearch from '../src/components/CardCarousel/CardSearch'
import MapHubsComponent from '../src/components/MapHubsComponent'
import Reflux from '../src/components/Rehydrate'
import LocaleStore from '../src/stores/LocaleStore'
import LayerList from '../src/components/Lists/LayerList'
import type {Layer} from '../src/types/layer'
import ErrorBoundary from '../src/components/ErrorBoundary'
import UserStore from '../src/stores/UserStore'
import FloatingAddButton from '../src/components/FloatingAddButton'

const { Title } = Typography

type Props = {
  layers: Array<Layer>,
  groups: Array<Object>,
  locale: string,
  footerConfig: Object,
  headerConfig: Object,
  _csrf: string,
  user: Object
}

/*
export async function getServerSideProps ({ query }: {query: Object}) {
  return {
    props: query.props
  }
}
*/

export default class Layers extends MapHubsComponent<Props, void> {
  static async getInitialProps ({ req, query }: {req: any, query: Object}) {
    if (req) return query.props
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
    const { layers, groups } = this.props

    return (
      <ErrorBoundary>
        <Header activePage='layers' {...this.props.headerConfig} />
        <main style={{margin: '10px'}}>
          <Row style={{marginTop: '20px', marginBottom: '10px'}}>
            <Title level={2}>{t('Layers')}</Title>
          </Row>
          <Row style={{width: '100%', height: 'calc(100vh - 150px)'}}>
            <LayerList layers={layers} groups={groups} t={t} />
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
