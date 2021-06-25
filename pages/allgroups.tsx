import React from 'react'
import Header from '../src/components/header'
import Footer from '../src/components/footer'
import { Row, Typography } from 'antd'
import CardSearch from '../src/components/CardCarousel/CardSearch'

import Reflux from '../src/components/Rehydrate'
import LocaleStore from '../src/stores/LocaleStore'
import GroupList from '../src/components/Lists/GroupList'
import type { Group } from '../src/stores/GroupStore'
import ErrorBoundary from '../src/components/ErrorBoundary'
import UserStore from '../src/stores/UserStore'
import FloatingAddButton from '../src/components/FloatingAddButton'
const { Title } = Typography
type Props = {
  groups: Array<Group>
  locale: string
  _csrf: string
  footerConfig: Record<string, any>
  headerConfig: Record<string, any>
  user: Record<string, any>
}
export default class AllGroups extends React.Component<Props, void> {
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
    const { groups } = this.props
    return (
      <ErrorBoundary>
        <Header activePage='groups' {...this.props.headerConfig} />
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
            <Title level={2}>{t('Groups')}</Title>
          </Row>
          <CardSearch cardType='group' t={t} />
          <Row
            justify='center'
            style={{
              marginBottom: '20px'
            }}
          >
            <GroupList showTitle={false} groups={groups} t={t} />
          </Row>
          <FloatingAddButton
            onClick={() => {
              window.location = '/creategroup'
            }}
            tooltip={t('Create New Group')}
          />
        </main>
        <Footer t={t} {...this.props.footerConfig} />
      </ErrorBoundary>
    )
  }
}
