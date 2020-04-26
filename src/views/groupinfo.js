// @flow
import React from 'react'
import Header from '../components/header'
import CardCarousel from '../components/CardCarousel/CardCarousel'
import cardUtil from '../services/card-util'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import type {Group} from '../stores/GroupStore'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'
import { PlusOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons'
import { Row, Col, Avatar, List, Button, Tooltip, Typography, Divider } from 'antd'
import SupervisorAccount from '@material-ui/icons/SupervisorAccount'

const { Title } = Typography

type Props = {
  group: Group,
  maps: Array<Object>,
  layers: Array<Object>,
  stories: Array<Object>,
  members: Array<Object>,
  canEdit: boolean,
  headerConfig: Object,
  locale: string,
  _csrf: string,
  user: Object
}

type State = {
  imageFailed?: boolean
}

export default class GroupInfo extends MapHubsComponent<Props, State> {
  static async getInitialProps ({ req, query }: {req: any, query: Object}) {
    const isServer = !!req

    if (isServer) {
      return query.props
    } else {
      console.error('getInitialProps called on client')
    }
  }

  static defaultProps = {
    maps: [],
    layers: [],
    stories: [],
    members: [],
    canEdit: false
  }

  constructor (props: Props) {
    super(props)
    Reflux.rehydrate(LocaleStore, {locale: props.locale, _csrf: props._csrf})
    if (props.user) {
      Reflux.rehydrate(UserStore, {user: props.user})
    }
    this.state = {}
  }

  render () {
    const {t} = this
    const { group, maps, layers, stories, canEdit, members } = this.props
    const { imageFailed } = this.state
    const groupId = group.group_id ? group.group_id : ''

    const mapCards = maps.map(cardUtil.getMapCard)
    const layerCards = layers.map(cardUtil.getLayerCard)
    const storyCards = stories.map(s => cardUtil.getStoryCard(s, this.t))
    const allCards = cardUtil.combineCards([mapCards, layerCards, storyCards])

    let descriptionWithLinks = ''

    if (group.description) {
      const localizedDescription = this.t(group.description)
      // regex for detecting links
      const regex = /(https?:\/\/([\w.-]+)+(:\d+)?(\/([\w./]*(\?\S+)?)?)?)/gi
      descriptionWithLinks = localizedDescription.replace(regex, "<a href='$1' target='_blank' rel='noopener noreferrer'>$1</a>")
    }

    return (
      <ErrorBoundary>
        <Header {...this.props.headerConfig} />
        <div style={{marginLeft: '10px', marginRight: '10px'}}>
          <Row style={{padding: '20px'}}>
            <Col sm={24} md={6} style={{padding: '5px'}}>
              <Row style={{marginBottom: '20px'}}>
                {!imageFailed &&
                  <Avatar
                    alt={t(group.name)} shape='square' size={256} src={'/img/resize/600?format=webp&quality=80&progressive=true&url=/group/' + groupId + '/image.png'} onError={() => {
                      this.setState({imageFailed: true})
                    }}
                  />}
                {imageFailed &&
                  <Avatar size={256} shape='square' style={{ color: '#FFF' }}>
                    {groupId.charAt(0).toUpperCase()}
                  </Avatar>}
              </Row>

            </Col>
            <Col sm={24} md={8} style={{padding: '5px'}}>
              <Title>{t(group.name)}</Title>
              <Row>
                <div dangerouslySetInnerHTML={{__html: descriptionWithLinks}} />
              </Row>
              {this.props.group.unofficial &&
                <Row>
                  <p><b>{t('Unofficial Group')}</b> - {t('This group is maintained by Maphubs using public data and is not intended to represent the listed organization. If you represent this group and would like to take ownership please contact us.')}</p>
                </Row>}
            </Col>
            <Col sm={24} md={10}>
              {canEdit &&
                <Row justify='end' align='middle' style={{marginBottom: '20px'}}>
                  <Col sm={24} md={6} style={{textAlign: 'right'}}>
                    <Button style={{margin: 'auto'}} href={'/map/new?group_id=' + groupId}><PlusOutlined />{t('Map')}</Button>
                  </Col>
                  <Col sm={24} md={6} style={{textAlign: 'right'}}>
                    <Button style={{margin: 'auto'}} href={'/createlayer?group_id=' + groupId}><PlusOutlined />{t('Layer')}</Button>
                  </Col>
                  <Col sm={24} md={6} style={{textAlign: 'right'}}>
                    <Button style={{margin: 'auto'}} href={'/createstory?group_id=' + groupId}><PlusOutlined />{t('Story')}</Button>
                  </Col>
                  <Col sm={24} md={6} style={{textAlign: 'right'}}>
                    <Button style={{margin: 'auto'}} href={`/group/${groupId}/admin`}><SettingOutlined />{t('Manage')}</Button>
                  </Col>
                </Row>}
              <Row>
                <List
                  size='small'
                  header={<div><b>{t('Members')}</b></div>}
                  bordered
                  dataSource={members}
                  style={{width: '100%'}}
                  renderItem={user => {
                    if (user.display_name === 'maphubs' && members.length > 1) {
                      return <span />
                    }
                    let adminIcon = ''
                    if (user.role === 'Administrator') {
                      adminIcon = (
                        <Tooltip title={t('Group Administrator')} placement='top'>
                          <SupervisorAccount />
                        </Tooltip>
                      )
                    }
                    return (
                      <List.Item actions={[adminIcon]}>
                        <List.Item.Meta
                          avatar={
                            user.image ? <Avatar src={user.image} alt={t('Profile Photo')} /> : <Avatar size={24} icon={<UserOutlined />} />
                          }
                          title={user.display_name}
                        />
                      </List.Item>
                    )
                  }}
                />
              </Row>
            </Col>
          </Row>
          <Divider />
          <Row>
            <CardCarousel cards={allCards} infinite={false} t={this.t} />
          </Row>
        </div>
      </ErrorBoundary>
    )
  }
}
