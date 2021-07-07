import React from 'react'
import { Row, Result, Button, Typography } from 'antd'
import GroupIcon from '@material-ui/icons/Group'
import Header from '../src/components/header'
import Footer from '../src/components/footer'
import CardCarousel from '../src/components/CardCarousel/CardCarousel'
// var debug = require('@bit/kriscarle.maphubs-utils.maphubs-utils.debug')('usermaps');
import cardUtil from '../src/services/card-util'

import Reflux from '../src/components/Rehydrate'
import LocaleStore from '../src/stores/LocaleStore'
import type { Group } from '../src/stores/GroupStore'
import ErrorBoundary from '../src/components/ErrorBoundary'
import UserStore from '../src/stores/UserStore'
import FloatingButton from '../src/components/FloatingButton'
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
}
type DefaultProps = {
  groups: Array<Record<string, any>>
  user: Record<string, any>
  canEdit: boolean
}
export default class UserGroups extends React.Component<Props> {
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
    const { t, props } = this
    const { canEdit, user, groups, headerConfig, footerConfig } = props
    return (
      <ErrorBoundary>
        <Header {...headerConfig} />
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
                cards={groups.map((group) => cardUtil.getGroupCard(group))}
                t={t}
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
                window.location.assign('/creategroup')
              }}
              tooltip={t('Create New Group')}
            />
          )}
        </main>
        <Footer t={t} {...footerConfig} />
      </ErrorBoundary>
    )
  }
}
