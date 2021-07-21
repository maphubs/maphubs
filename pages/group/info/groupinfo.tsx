import React, { useState } from 'react'
import { GetServerSideProps } from 'next'
import { useSession, getSession } from 'next-auth/client'
import Layout from '../../../src/components/Layout'
import CardCarousel from '../../../src/components/CardCarousel/CardCarousel'
import cardUtil from '../../../src/services/card-util'
import type { Group } from '../../../src/stores/GroupStore'
import ErrorBoundary from '../../../src/components/ErrorBoundary'
import { PlusOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons'
import {
  Row,
  Col,
  Avatar,
  List,
  Button,
  Tooltip,
  Typography,
  Divider
} from 'antd'
import SupervisorAccount from '@material-ui/icons/SupervisorAccount'
import useT from '../../../src/hooks/useT'

// SSR only
import GroupModel from '../../../src/models/group'
import LayerModel from '../../../src/models/layer'
import MapModel from '../../../src/models/map'
import StoryModel from '../../../src/models/story'
import { Map } from '../../../src/types/map'
import { Story } from '../../../src/types/story'
import { Layer } from '../../../src/types/layer'

const { Title } = Typography
type Props = {
  group: Group
  maps: Map[]
  layers: Layer[]
  stories: Story[]
  members: Array<Record<string, any>>
  allowedToModifyGroup?: boolean
}
type State = {
  imageFailed?: boolean
}

// use SSR for SEO
export const getServerSideProps: GetServerSideProps = async (context) => {
  const group_id = context.params.group[0]
  const group = await GroupModel.getGroupByID(group_id)
  const session = await getSession(context)
  let allowedToModifyGroup
  if (session?.user) {
    allowedToModifyGroup = await GroupModel.allowedToModify(
      group.group_id,
      session.user.id || session.user.sub
    )
  }
  if (!group) {
    return {
      notFound: true
    }
  }

  return {
    props: {
      group,
      maps: await MapModel.getGroupMaps(group_id, allowedToModifyGroup),
      layers: await LayerModel.getGroupLayers(group_id, allowedToModifyGroup),
      stories: await StoryModel.getGroupStories(group_id, allowedToModifyGroup),
      members: await GroupModel.getGroupMembers(group_id),
      allowedToModifyGroup
    }
  }
}
const GroupInfo = ({
  group,
  maps,
  layers,
  stories,
  members,
  allowedToModifyGroup
}: Props): JSX.Element => {
  const { t } = useT()
  const [session] = useSession()
  const [imageFailed, setImageFailed] = useState(false)

  const mapCards = maps.map((map) => cardUtil.getMapCard(map))
  const layerCards = layers.map((layer, i) => cardUtil.getLayerCard(layer, i))
  const storyCards = stories.map((s) => cardUtil.getStoryCard(s, t))
  const allCards = cardUtil.combineCards([mapCards, layerCards, storyCards])
  let descriptionWithLinks = ''

  if (group.description) {
    const localizedDescription = t(group.description)
    // regex for detecting links
    const regex = /(https?:\/\/([\w.-]+)+(:\d+)?(\/([\w./]*(\?\S+)?)?)?)/gi
    descriptionWithLinks = localizedDescription.replace(
      regex,
      "<a href='$1' target='_blank' rel='noopener noreferrer'>$1</a>"
    )
  }

  return (
    <ErrorBoundary t={t}>
      <Layout title={t(group.name)} hideFooter>
        <div
          style={{
            marginLeft: '10px',
            marginRight: '10px'
          }}
        >
          <Row
            style={{
              padding: '20px'
            }}
          >
            <Col
              sm={24}
              md={6}
              style={{
                padding: '5px'
              }}
            >
              <Row
                style={{
                  marginBottom: '20px'
                }}
              >
                {!imageFailed && (
                  <Avatar
                    alt={t(group.name)}
                    shape='square'
                    size={256}
                    src={
                      '/img/resize/600?quality=80&progressive=true&url=/group/' +
                      group.group_id +
                      '/image.png'
                    }
                    onError={() => {
                      setImageFailed(true)
                      return true
                    }}
                  />
                )}
                {imageFailed && (
                  <Avatar
                    size={256}
                    shape='square'
                    style={{
                      color: '#FFF'
                    }}
                  >
                    {group.group_id.charAt(0).toUpperCase()}
                  </Avatar>
                )}
              </Row>
            </Col>
            <Col
              sm={24}
              md={8}
              style={{
                padding: '5px'
              }}
            >
              <Title>{t(group.name)}</Title>
              <Row>
                <div
                  dangerouslySetInnerHTML={{
                    __html: descriptionWithLinks
                  }}
                />
              </Row>
              {group.unofficial && (
                <Row>
                  <p>
                    <b>{t('Unofficial Group')}</b> -{' '}
                    {t(
                      'This group is maintained by Maphubs using public data and is not intended to represent the listed organization. If you represent this group and would like to take ownership please contact us.'
                    )}
                  </p>
                </Row>
              )}
            </Col>
            <Col sm={24} md={10}>
              {allowedToModifyGroup && (
                <Row
                  justify='end'
                  align='middle'
                  style={{
                    marginBottom: '20px'
                  }}
                >
                  <Col
                    sm={24}
                    md={6}
                    style={{
                      textAlign: 'right'
                    }}
                  >
                    <Button
                      style={{
                        margin: 'auto'
                      }}
                      href={'/map/new?group_id=' + group.group_id}
                    >
                      <PlusOutlined />
                      {t('Map')}
                    </Button>
                  </Col>
                  <Col
                    sm={24}
                    md={6}
                    style={{
                      textAlign: 'right'
                    }}
                  >
                    <Button
                      style={{
                        margin: 'auto'
                      }}
                      href={'/createlayer?group_id=' + group.group_id}
                    >
                      <PlusOutlined />
                      {t('Layer')}
                    </Button>
                  </Col>
                  <Col
                    sm={24}
                    md={6}
                    style={{
                      textAlign: 'right'
                    }}
                  >
                    <Button
                      style={{
                        margin: 'auto'
                      }}
                      href={'/createstory?group_id=' + group.group_id}
                    >
                      <PlusOutlined />
                      {t('Story')}
                    </Button>
                  </Col>
                  <Col
                    sm={24}
                    md={6}
                    style={{
                      textAlign: 'right'
                    }}
                  >
                    <Button
                      style={{
                        margin: 'auto'
                      }}
                      href={`/group/${group.group_id}/admin`}
                    >
                      <SettingOutlined />
                      {t('Manage')}
                    </Button>
                  </Col>
                </Row>
              )}
              <Row>
                <List
                  size='small'
                  header={
                    <div>
                      <b>{t('Members')}</b>
                    </div>
                  }
                  bordered
                  dataSource={members}
                  style={{
                    width: '100%'
                  }}
                  renderItem={(user) => {
                    if (user.display_name === 'maphubs' && members.length > 1) {
                      return <span />
                    }

                    let adminIcon = <></>

                    if (user.role === 'Administrator') {
                      adminIcon = (
                        <Tooltip
                          title={t('Group Administrator')}
                          placement='top'
                        >
                          <SupervisorAccount />
                        </Tooltip>
                      )
                    }

                    return (
                      <List.Item actions={[adminIcon]}>
                        <List.Item.Meta
                          avatar={
                            user.image ? (
                              <Avatar
                                src={user.image}
                                alt={t('Profile Photo')}
                              />
                            ) : (
                              <Avatar size={24} icon={<UserOutlined />} />
                            )
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
            <CardCarousel cards={allCards} />
          </Row>
        </div>
      </Layout>
    </ErrorBoundary>
  )
}
export default GroupInfo
