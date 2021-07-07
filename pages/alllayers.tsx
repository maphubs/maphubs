import React from 'react'
import Header from '../src/components/header'
import Footer from '../src/components/footer'
import { Row, Col, Button, Typography } from 'antd'

import Reflux from '../src/components/Rehydrate'
import LocaleStore from '../src/stores/LocaleStore'
import LayerList from '../src/components/Lists/LayerList'
import type { Layer } from '../src/types/layer'
import ErrorBoundary from '../src/components/ErrorBoundary'
import UserStore from '../src/stores/UserStore'
const { Title } = Typography
type Props = {
  layers: Array<Layer>
  groups: Array<Record<string, any>>
  locale: string
  footerConfig: Record<string, any>
  headerConfig: Record<string, any>
  _csrf: string
  user: Record<string, any>
}
export default class Layers extends React.Component<Props> {
  static async getInitialProps({
    req,
    query
  }: {
    req: any
    query: Record<string, any>
  }): Promise<any> {
    if (req) return query.props
  }

  constructor(props: Props) {
    super(props)
    Reflux.rehydrate(LocaleStore, {
      locale: props.locale,
      _csrf: props._csrf
    })

    if (props.user) {
      Reflux.rehydrate(UserStore, {
        user: props.user
      })
    }
  }

  render(): JSX.Element {
    const { t, props } = this
    const { layers, groups, headerConfig, footerConfig } = props
    return (
      <ErrorBoundary>
        <Header activePage='layers' {...headerConfig} />
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
                  window.location.assign('/createlayer')
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
            <LayerList layers={layers} groups={groups} t={t} />
          </Row>
        </main>
        <Footer t={t} {...footerConfig} />
      </ErrorBoundary>
    )
  }
}
