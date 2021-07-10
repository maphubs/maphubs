import React from 'react'
import Header from '../src/components/header'
import Footer from '../src/components/footer'
import { Row, Typography } from 'antd'
import CardSearch from '../src/components/CardCarousel/CardSearch'
import GroupList from '../src/components/Lists/GroupList'
import type { Group } from '../src/types/group'
import ErrorBoundary from '../src/components/ErrorBoundary'
import FloatingAddButton from '../src/components/FloatingAddButton'
const { Title } = Typography
type Props = {
  groups: Group[]
  locale: string
  _csrf: string
  footerConfig: Record<string, any>
  headerConfig: Record<string, any>
  user: Record<string, any>
}
export default class AllGroups extends React.Component<Props> {
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

  render(): JSX.Element {
    const { t, props } = this
    const { groups, headerConfig, footerConfig } = props
    return (
      <ErrorBoundary t={t}>
        <Header activePage='groups' {...headerConfig} />
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
              window.location.assign('/creategroup')
            }}
            tooltip={t('Create New Group')}
          />
        </main>
        <Footer t={t} {...footerConfig} />
      </ErrorBoundary>
    )
  }
}
