import React from 'react'
import Header from '../src/components/header'
import Footer from '../src/components/footer'
import { Row, Button, Typography } from 'antd'
import CardCollection from '../src/components/CardCarousel/CardCollection'
import CardSearch from '../src/components/CardCarousel/CardSearch'
import cardUtil from '../src/services/card-util'

import Reflux from '../src/components/Rehydrate'
import LocaleStore from '../src/stores/LocaleStore'
import ErrorBoundary from '../src/components/ErrorBoundary'
import UserStore from '../src/stores/UserStore'
import FloatingAddButton from '../src/components/FloatingAddButton'
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
export default class Groups extends React.Component<Props> {
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
    const { t, props } = this
    const {
      featuredGroups,
      popularGroups,
      recentGroups,
      headerConfig,
      footerConfig
    } = props
    const featuredCards = featuredGroups.map((group) =>
      cardUtil.getGroupCard(group)
    )
    const popularCards = popularGroups.map((group) =>
      cardUtil.getGroupCard(group)
    )
    const recentCards = recentGroups.map((group) =>
      cardUtil.getGroupCard(group)
    )
    return (
      <ErrorBoundary>
        <Header activePage='groups' {...headerConfig} />
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
                t={t}
              />
            )}
            <CardCollection
              title={t('Popular')}
              cards={popularCards}
              viewAllLink='/groups/all'
              t={t}
            />
            <CardCollection
              title={t('Recent')}
              cards={recentCards}
              viewAllLink='/groups/all'
              t={t}
            />

            <FloatingAddButton
              onClick={() => {
                window.location.assign('/creategroup')
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
        <Footer t={t} {...footerConfig} />
      </ErrorBoundary>
    )
  }
}
