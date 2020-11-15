// @flow
import type {Node} from "React";import React from 'react'
import Header from '../components/header'
import Footer from '../components/footer'
import { Row, Typography } from 'antd'
import CardSearch from '../components/CardCarousel/CardSearch'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import GroupList from '../components/Lists/GroupList'
import type {Group} from '../stores/GroupStore'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'
import FloatingAddButton from '../components/FloatingAddButton'

const { Title } = Typography

type Props = {
  groups: Array<Group>,
  locale: string,
  _csrf: string,
  footerConfig: Object,
  headerConfig: Object,
  user: Object
}

export default class AllGroups extends MapHubsComponent<Props, void> {
  static async getInitialProps ({ req, query }: {req: any, query: Object}): Promise<any> {
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

  render (): Node {
    const {t} = this
    const { groups } = this.props

    return (
      <ErrorBoundary>
        <Header activePage='groups' {...this.props.headerConfig} />
        <main style={{margin: '10px'}}>
          <Row style={{marginTop: '20px', marginBottom: '10px'}}>
            <Title level={2}>{t('Groups')}</Title>
          </Row>
          <CardSearch cardType='group' t={t} />
          <Row justify='center' style={{marginBottom: '20px'}}>
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
