import React, { useState, useEffect } from 'react'
import { GetServerSideProps } from 'next'
import { useSession, getSession } from 'next-auth/client'
import { useRouter } from 'next/router'
import Layout from '../../../src/components/Layout'
import {
  message,
  notification,
  Modal,
  Row,
  Button,
  Tabs,
  PageHeader,
  Divider,
  Typography
} from 'antd'
import LayerSettings from '../../../src/components/CreateLayer/LayerSettings'
import LayerAdminSettings from '../../../src/components/CreateLayer/LayerAdminSettings'
import PresetEditor from '../../../src/components/CreateLayer/PresetEditor'
import LayerStyle from '../../../src/components/CreateLayer/LayerStyle'
import request from 'superagent'
import _uniq from 'lodash.uniq'
import _mapvalues from 'lodash.mapvalues'
import LayerAPI from '../../../src/redux/reducers/layer-api'
import slugify from 'slugify'
import ErrorBoundary from '../../../src/components/ErrorBoundary'

import type { Layer } from '../../../src/types/layer'
import type { Group } from '../../../src/types/group'
import { checkClientError } from '../../../src/services/client-error-response'
import useT from '../../../src/hooks/useT'

import { useDispatch, useSelector } from '../../../src/redux/hooks'
import {
  selectMapStyle,
  loadLayer
} from '../../../src/redux/reducers/layerSlice'

//SSR Only
import LayerModel from '../../../src/models/layer'
import PageModel from '../../../src/models/page'
import GroupModel from '../../../src/models/group'

const { confirm } = Modal
const { Title } = Typography
const TabPane = Tabs.TabPane

type Props = {
  layer: Layer
  userGroups: Group[]
  mapConfig: Record<string, any>
  allowedToModifyLayer?: boolean
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const layer_id = Number.parseInt(context.params.layeradmin[0])
  const layer = await LayerModel.getLayerByID(layer_id)

  if (!layer) {
    return {
      notFound: true
    }
  }

  layer.last_updated = layer.last_updated.toISOString()
  layer.creation_time = layer.creation_time.toISOString()

  const session = await getSession(context)
  let allowedToModifyLayer = null
  if (session?.user) {
    allowedToModifyLayer = await LayerModel.allowedToModify(
      layer_id,
      session.user.id || session.user.sub
    )
  }

  const mapConfig = (await PageModel.getPageConfigs(['map'])[0]) || null
  return {
    props: {
      layer,
      userGroups: await GroupModel.getGroupsForUser(
        session?.user.id || session?.user.sub
      ),
      mapConfig,
      allowedToModifyLayer
    }
  }
}

const LayerAdmin = ({
  layer,
  userGroups,
  mapConfig,
  allowedToModifyLayer
}: Props): JSX.Element => {
  const [session] = useSession()
  const router = useRouter()
  const { t } = useT()
  const dispatch = useDispatch()
  const [tab, setTab] = useState('settings')
  const [canSavePresets, setCanSavePresets] = useState(false)

  const { style, labels, legend_html, preview_position, presets } =
    useSelector(selectMapStyle)

  const user = session.user

  useEffect(() => {
    dispatch(loadLayer(layer))
  }, [layer, dispatch])

  /*
  constructor(props: Props) {
    super(props)

    const baseMapContainerInit: {
      baseMap?: string
      bingKey: string
      tileHostingKey: string
      mapboxAccessToken: string
      baseMapOptions?: Record<string, any>
    } = {
      bingKey: process.env.NEXT_PUBLIC_BING_KEY,
      mapboxAccessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    }

    if (props.mapConfig && props.mapConfig.baseMapOptions) {
      baseMapContainerInit.baseMapOptions = props.mapConfig.baseMapOptions
    }

    this.BaseMapState = new BaseMapContainer(baseMapContainerInit)
    this.MapState = new MapContainer()
  }
  */

  const saveStyle = async () => {
    try {
      await LayerAPI.saveStyle(layer.layer_id, {
        style,
        labels,
        legend_html,
        preview_position
      })
      message.success(t('Layer Saved'))
    } catch (err) {
      notification.error({
        message: t('Error'),
        description: err.message || err.toString() || err,
        duration: 0
      })
    }
  }
  const onSave = (): void => {
    message.success(t('Layer Saved'))
  }

  const savePresets = async () => {
    // check for duplicate presets
    if (presets) {
      const tags = _mapvalues(presets, 'tag')

      const uniqTags = _uniq(tags)

      if (tags.length > uniqTags.length) {
        notification.error({
          message: t('Data Error'),
          description: t(
            'Duplicate tag, please choose a unique tag for each field'
          ),
          duration: 0
        })
      } else {
        // save presets
        try {
          await LayerAPI.submitPresets(presets, style, layer.layer_id, false)
          saveStyle()
        } catch (err) {
          notification.error({
            message: t('Error'),
            description: err.message || err.toString() || err,
            duration: 0
          })
        }
      }
    }
  }

  const deleteLayer = (): void => {
    confirm({
      title: t('Confirm Deletion'),
      content:
        t('Please confirm removal of') +
        ' ' +
        t(layer.name) +
        '. ' +
        t(
          'All additions, modifications, and feature notes will be deleted. This layer will also be removed from all maps, and stories.'
        ),
      okText: t('Delete'),
      okType: 'danger',

      async onOk() {
        const closeMessage = message.loading(t('Deleting'), 0)
        try {
          await LayerAPI.deleteLayer(layer.layer_id)
          message.success(t('Layer Deleted'), 1, () => {
            router.push('/')
          })
        } catch (err) {
          notification.error({
            message: t('Error'),
            description: err.message || err.toString() || err,
            duration: 0
          })
        } finally {
          closeMessage()
        }
      }
    })
  }
  const refreshRemoteLayer = (): void => {
    request
      .post('/api/layer/remote/refresh')
      .type('json')
      .accept('json')
      .send({
        layer_id: layer.layer_id
      })
      .end((err, res) => {
        checkClientError({
          res,
          err,
          onSuccess: () => {
            if (err) {
              notification.error({
                message: t('Error'),
                description: err.message || err.toString() || err,
                duration: 0
              })
            } else {
              message.success(t('Layer Updated'))
            }
          }
        })
      })
  }

  const layerId = layer.layer_id || 0
  const layerName = slugify(t(layer.name))
  const layerInfoUrl = `/layer/info/${layerId}/${layerName}`

  return layer.remote ? (
    <ErrorBoundary t={t}>
      <Layout title={t('Layer Settings')} hideFooter>
        <div>
          <div className='container'>
            <Row>
              <PageHeader
                onBack={() => {
                  router.push(layerInfoUrl)
                }}
                style={{
                  padding: '5px'
                }}
                title={t('Back to Layer')}
              />
            </Row>
            <Row
              style={{
                textAlign: 'center'
              }}
            >
              <Title level={3}>{t('Unable to modify remote layers.')}</Title>
              <div className='center-align center'>
                <Button
                  type='primary'
                  style={{
                    marginTop: '20px'
                  }}
                  onClick={refreshRemoteLayer}
                >
                  {t('Refresh Remote Layer')}
                </Button>
              </div>
              <p>
                {t(
                  'You can remove this layer using the button in the bottom right.'
                )}
              </p>
            </Row>
            <Row>
              <Button danger onClick={deleteLayer}>
                {t('Delete Layer')}
              </Button>
            </Row>
          </div>
        </div>
      </Layout>
    </ErrorBoundary>
  ) : (
    <ErrorBoundary t={t}>
      <Layout title={t('Layer Settings')} hideFooter>
        <div
          style={{
            height: 'calc(100% - 50px)'
          }}
        >
          <Row>
            <PageHeader
              onBack={() => {
                router.push(layerInfoUrl)
              }}
              style={{
                padding: '5px'
              }}
              title={t('Back to Layer')}
            />
          </Row>
          <Row
            style={{
              height: 'calc(100% - 50px)'
            }}
          >
            <style jsx global>
              {`
                .ant-tabs-content {
                  height: calc(100% - 44px);
                }
                .ant-tabs-tabpane {
                  height: 100%;
                }

                .ant-tabs-nav-wrap {
                  padding-left: 10px;
                }

                .ant-tabs > .ant-tabs-content > .ant-tabs-tabpane-inactive {
                  display: none;
                }
              `}
            </style>
            <Tabs
              defaultActiveKey='settings'
              style={{
                height: '100%',
                width: '100%'
              }}
              tabBarStyle={{
                marginBottom: 0
              }}
              animated={false}
            >
              <TabPane
                tab={t('Info')}
                key='settings'
                style={{
                  position: 'relative'
                }}
              >
                <LayerSettings
                  groups={userGroups}
                  showGroup={false}
                  warnIfUnsaved
                  onSubmit={onSave}
                  submitText={t('Save')}
                />
                <Row
                  style={{
                    marginBottom: '20px'
                  }}
                >
                  <Divider />
                </Row>
                <Row
                  style={{
                    marginBottom: '20px',
                    padding: '0px 20px'
                  }}
                >
                  <Title
                    level={3}
                    style={{
                      fontSize: '18px'
                    }}
                  >
                    {t('Modify Data')}
                  </Title>
                  <Row
                    style={{
                      marginBottom: '20px'
                    }}
                  >
                    <Button
                      type='primary'
                      href={`/layer/replace/${layerId}/${layerName}`}
                    >
                      {t('Replace Layer Data')}
                    </Button>
                  </Row>
                  <Row
                    style={{
                      marginBottom: '20px'
                    }}
                  >
                    <Button danger onClick={deleteLayer}>
                      {t('Delete Layer')}
                    </Button>
                  </Row>
                </Row>
              </TabPane>
              <TabPane
                tab={t('Fields')}
                key='fields'
                style={{
                  position: 'relative'
                }}
              >
                <div
                  className='container'
                  style={{
                    height: '100%'
                  }}
                >
                  <Title level={3}>{t('Data Fields')}</Title>
                  <Row justify='end'>
                    <Button
                      type='primary'
                      onClick={savePresets}
                      disabled={!canSavePresets}
                    >
                      {t('Save')}
                    </Button>
                  </Row>
                  <Row
                    style={{
                      height: 'calc(100% - 100px)',
                      overflowY: 'auto'
                    }}
                  >
                    <PresetEditor
                      onValid={() => {
                        setCanSavePresets(true)
                      }}
                      onInvalid={() => {
                        setCanSavePresets(false)
                      }}
                    />
                  </Row>
                </div>
              </TabPane>
              <TabPane
                tab={t('Style/Display')}
                key='style'
                style={{
                  position: 'relative'
                }}
              >
                <Row
                  style={{
                    height: 'calc(100% - 50px)'
                  }}
                >
                  <LayerStyle onSubmit={onSave} mapConfig={mapConfig} />
                </Row>
              </TabPane>
              {user.role === 'admin' && (
                <TabPane
                  tab={t('Admin Only')}
                  key='admin'
                  style={{
                    position: 'relative'
                  }}
                >
                  <LayerAdminSettings
                    groups={userGroups}
                    warnIfUnsaved
                    onSubmit={onSave}
                    submitText={t('Save')}
                  />
                </TabPane>
              )}
            </Tabs>
          </Row>
        </div>
      </Layout>
    </ErrorBoundary>
  )
}
export default LayerAdmin
