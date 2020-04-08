// @flow
import React from 'react'
import Header from '../components/header'
import Footer from '../components/footer'
import { Row, Col, Typography } from 'antd'
import CardSearch from '../components/CardCarousel/CardSearch'
import cardUtil from '../services/card-util'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import GroupList from '../components/Lists/GroupList'
import Toggle from '../components/forms/toggle'
import Formsy from 'formsy-react'
import CardGrid from '../components/CardCarousel/CardGrid'
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

type State = {
  showList: boolean
}

export default class AllGroups extends MapHubsComponent<Props, State> {
  static async getInitialProps ({ req, query }: {req: any, query: Object}) {
    const isServer = !!req

    if (isServer) {
      return query.props
    } else {
      console.error('getInitialProps called on client')
    }
  }

  state = {
    showList: false
  }

  constructor (props: Props) {
    super(props)
    Reflux.rehydrate(LocaleStore, {locale: props.locale, _csrf: props._csrf})
    if (props.user) {
      Reflux.rehydrate(UserStore, {user: props.user})
    }
  }

  onModeChange = (showList: boolean) => {
    this.setState({showList})
  }

  render () {
    const {t} = this
    const { groups } = this.props
    const { showList } = this.state

    return (
      <ErrorBoundary>
        <Header activePage='groups' {...this.props.headerConfig} />
        <main style={{margin: '10px'}}>
          <Row style={{marginTop: '20px', marginBottom: '10px'}}>
            <Title level={2}>{t('Groups')}</Title>
          </Row>
          <CardSearch cardType='group' t={t} />
          <Row>
            <Row justify='end'>
              <Col style={{margin: '20px'}}>
                <Formsy>
                  <Toggle name='mode' onChange={this.onModeChange} labelOff={t('Grid')} labelOn={t('List')} checked={showList} />
                </Formsy>
              </Col>
            </Row>
            <Row style={{marginBottom: '20px'}}>
              {showList &&
                <div className='container'>
                  <GroupList showTitle={false} groups={groups} t={t} />
                </div>}
              {!showList &&
                <CardGrid cards={groups.map(cardUtil.getGroupCard)} t={t} />}
            </Row>
            <FloatingAddButton
              onClick={() => {
                window.location = '/creategroup'
              }}
              tooltip={t('Create New Group')}
            />
          </Row>
        </main>
        <Footer t={t} {...this.props.footerConfig} />
      </ErrorBoundary>
    )
  }
}
