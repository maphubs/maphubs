import React from 'react'
import Header from '../components/header'
import Footer from '../components/footer'
import { Row, Button, Typography } from 'antd'
import CardCollection from '../components/CardCarousel/CardCollection'
import CardSearch from '../components/CardCarousel/CardSearch'
import cardUtil from '../services/card-util'

import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'
import FloatingAddButton from '../components/FloatingAddButton'
const { Title } = Typography
type Props = {
  featuredGroups: Array<Record<string, any>>
  recentGroups: Array<Record<string, any>>
  popularGroups: Array<Record<string, any>>
  locale: string
  _csrf: string
  footerConfig: Record<string, any>
  headerConfig: Record<string, any>
  user: Record<string, any>
}
export default class Groups extends React.Component<Props, void> {
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
        groups: Array<any>
      } = {
    groups: []
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
    const { t } = this
    const featuredCards = this.props.featuredGroups.map(cardUtil.getGroupCard)
    const popularCards = this.props.popularGroups.map(cardUtil.getGroupCard)
    const recentCards = this.props.recentGroups.map(cardUtil.getGroupCard)
    return (
      <ErrorBoundary>
        <Header activePage='groups' {...this.props.headerConfig} />
        <main
          style={{
            margin: '10px'
          }}
        >
          <div
            style={{
              marginTop: '20px',
              marginBottom: '10px'
            }}
          >
            <Row>
              <Title level={2}>{t('Groups')}</Title>
            </Row>
          </div>
          <div>
            <CardSearch cardType='group' t={t} />
            {featuredCards.length > 0 && (
              <CardCollection
                title={t('Featured')}
                cards={featuredCards}
                viewAllLink='/groups/all'
              />
            )}
            <CardCollection
              title={t('Popular')}
              cards={popularCards}
              viewAllLink='/groups/all'
            />
            <CardCollection
              title={t('Recent')}
              cards={recentCards}
              viewAllLink='/groups/all'
            />

            <FloatingAddButton
              onClick={() => {
                window.location = '/creategroup'
              }}
              tooltip={t('Create New Group')}
            />
          </div>
          <Row
            justify='center'
            style={{
              marginBottom: '20px',
              textAlign: 'center'
            }}
          >
            <Button type='primary' href='/groups/all'>
              {t('View All Groups')}
            </Button>
          </Row>
        </main>
        <Footer t={t} {...this.props.footerConfig} />
      </ErrorBoundary>
    )
  }
}
