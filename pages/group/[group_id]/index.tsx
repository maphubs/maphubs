import React, { useState } from 'react'
import Link from 'next/link'
import { GetServerSideProps } from 'next'
import { useSession, getSession } from 'next-auth/client'
import Layout from '../../../src/components/Layout'
import CardCarousel from '../../../src/components/CardCarousel/CardCarousel'
import cardUtil from '../../../src/services/card-util'
import { Group } from '../../../src/types/group'
import ErrorBoundary from '../../../src/components/ErrorBoundary'
import { PlusOutlined, SettingOutlined } from '@ant-design/icons'
import urlUtil from '@bit/kriscarle.maphubs-utils.maphubs-utils.url-util'
import { NextSeo } from 'next-seo'
import { Row, Col, Avatar, Button, Typography, Divider } from 'antd'
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
  allowedToModifyGroup?: boolean
}
type State = {
  imageFailed?: boolean
}

// use SSR for SEO
export const getServerSideProps: GetServerSideProps = async (context) => {
  const group_id = context.params.group_id as string
  const group = await GroupModel.getGroupByID(group_id)
  const session = await getSession(context)
  let allowedToModifyGroup
  if (session?.user) {
    allowedToModifyGroup = await GroupModel.allowedToModify(
      group.group_id,
      Number.parseInt(session.sub)
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
      maps: await MapModel.getGroupMaps(group_id),
      layers: await LayerModel.getGroupLayers(group_id, allowedToModifyGroup),
      stories: await StoryModel.getGroupStories(group_id, allowedToModifyGroup),
      allowedToModifyGroup
    }
  }
}
const GroupInfo = ({
  group,
  maps,
  layers,
  stories,
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

  const baseUrl = urlUtil.getBaseUrl()
  const canonical = `${baseUrl}/group/${group.group_id}`
  const imageUrl = `${baseUrl}/api/group/${group.group_id}/image.png`
  return (
    <>
      <NextSeo
        title={t(group.name)}
        description={t(group.description)}
        canonical={canonical}
        openGraph={{
          url: canonical,
          title: t(group.name),
          description: t(group.description),
          images: [
            {
              url: imageUrl,
              width: 600,
              height: 600,
              alt: t(group.name)
            }
          ],
          site_name: process.env.NEXT_PUBLIC_PRODUCT_NAME
        }}
        twitter={{
          handle: process.env.NEXT_PUBLIC_TWITTER,
          site: process.env.NEXT_PUBLIC_TWITTER,
          cardType: 'summary'
        }}
      />
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
                      src={`/api/group/${group.group_id}/image.png`}
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
                        href={'/create/story?group_id=' + group.group_id}
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
                      <Link href={`/group/${group.group_id}/admin`}>
                        <Button
                          style={{
                            margin: 'auto'
                          }}
                        >
                          <SettingOutlined />
                          {t('Manage')}
                        </Button>
                      </Link>
                    </Col>
                  </Row>
                )}
              </Col>
            </Row>
            <Divider />
            <Row>
              <CardCarousel cards={allCards} />
            </Row>
          </div>
        </Layout>
      </ErrorBoundary>
    </>
  )
}
export default GroupInfo
