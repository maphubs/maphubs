import React from 'react'
import { Row, Result, Button, Typography } from 'antd'
import MapIcon from '@material-ui/icons/Map'
import Header from '../src/components/header'
import Footer from '../src/components/footer'
import CardCarousel from '../src/components/CardCarousel/CardCarousel'
import cardUtil from '../src/services/card-util'
import ErrorBoundary from '../src/components/ErrorBoundary'
import FloatingButton from '../src/components/FloatingButton'
import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig
const { Title } = Typography
type Props = {
  maps: Array<Record<string, any>>
  user: Record<string, any>
  myMaps: boolean
  locale: string
  _csrf: string
  footerConfig: Record<string, any>
  headerConfig: Record<string, any>
}
export default class UserMaps extends React.Component<Props> {
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

  static defaultProps:
    | any
    | {
        maps: Array<any>
        myMaps: boolean
        user: {}
      } = {
    maps: [],
    user: {},
    myMaps: false
  }

  render(): JSX.Element {
    const { t, props } = this
    const { myMaps, maps, footerConfig, headerConfig } = props
    return (
      <ErrorBoundary t={t}>
        <Header {...headerConfig} />
        <main
          style={{
            height: 'calc(100% - 70px)',
            padding: '10px'
          }}
        >
          {(!maps || maps.length === 0) && (
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
                      color: MAPHUBS_CONFIG.primaryColor,
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
          {maps && maps.length > 0 && (
            <Row
              style={{
                marginBottom: '20px'
              }}
            >
              <Title level={2}>{t('My Maps')}</Title>
              <CardCarousel
                cards={maps.map((map) => cardUtil.getMapCard(map))}
                t={t}
              />
            </Row>
          )}
          {myMaps && (
            <FloatingButton
              onClick={() => {
                window.location.assign('/map/new')
              }}
              tooltip={t('Create New Map')}
            />
          )}
        </main>
        <Footer t={t} {...footerConfig} />
      </ErrorBoundary>
    )
  }
}
