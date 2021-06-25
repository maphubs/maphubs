import React from 'react'
import { Row, Result, Button, Typography } from 'antd'
import GroupIcon from '@material-ui/icons/Group'
import Header from '../components/header'
import Footer from '../components/footer'
import CardCarousel from '../components/CardCarousel/CardCarousel'
// var debug = require('@bit/kriscarle.maphubs-utils.maphubs-utils.debug')('usermaps');
import cardUtil from '../services/card-util'

import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import type { Group } from '../stores/GroupStore'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'
import FloatingButton from '../components/FloatingButton'
import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig
const { Title } = Typography
type Props = {
  groups: Array<Group>
  user: Record<string, any>
  canEdit: boolean
  locale: string
  _csrf: string
  footerConfig: Record<string, any>
  headerConfig: Record<string, any>
  user: Record<string, any>
}
type DefaultProps = {
  groups: Array<Record<string, any>>
  user: Record<string, any>
  canEdit: boolean
}
export default class UserGroups extends React.Component<Props, void> {
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

  static defaultProps: DefaultProps = {
    groups: [],
    user: {},
    canEdit: false
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
    const { canEdit, user, groups } = this.props
    return (
      <ErrorBoundary>
        <Header {...this.props.headerConfig} />
        <main
          style={{
            marginLeft: '10px',
            marginRight: '10px'
          }}
        >
          {canEdit && <Title level={2}>{t('My Groups')}</Title>}
          {!canEdit && (
            <Title level={2}>
              {t('Groups for user: ') + user.display_name}
            </Title>
          )}
          {groups?.length > 0 && (
            <Row
              style={{
                marginBottom: '20px'
              }}
            >
              <CardCarousel
                infinite={false}
                cards={groups.map(cardUtil.getGroupCard)}
                t={this.t}
              />
            </Row>
          )}
          {(!groups || groups.length === 0) && (
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
                  <GroupIcon
                    style={{
                      color: MAPHUBS_CONFIG.primaryColor,
                      fontSize: '72px'
                    }}
                  />
                }
                title={t('Click the button below to create your first group')}
                extra={
                  <Button type='primary' href='/creategroup'>
                    {t('Create New Group')}
                  </Button>
                }
              />
            </Row>
          )}
          {canEdit && (
            <FloatingButton
              onClick={() => {
                window.location = '/creategroup'
              }}
              tooltip={t('Create New Group')}
            />
          )}
        </main>
        <Footer t={t} {...this.props.footerConfig} />
      </ErrorBoundary>
    )
  }
}
