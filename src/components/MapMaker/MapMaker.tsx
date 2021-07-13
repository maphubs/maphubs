import React from 'react'
import LayerList from '../Map/LayerList'
import _isEqual from 'lodash.isequal'
import _find from 'lodash.find'
import {
  Drawer,
  Button,
  Row,
  Col,
  Tabs,
  Modal,
  message,
  notification,
  Tooltip
} from 'antd'
import { DeleteOutlined, DownloadOutlined } from '@ant-design/icons'
import Map from '../Map'
import MiniLegend from '../Map/MiniLegend'
import AddLayerPanel from './AddLayerPanel'
import SaveMapModal from './SaveMapModal'
import MapSettingsPanel from './MapSettingsPanel'
import MapMakerStore from '../../stores/MapMakerStore'
import UserStore from '../../stores/UserStore'
import Actions from '../../actions/MapMakerActions'
import EditLayerPanel from './EditLayerPanel'
import MapLayerDesigner from '../LayerDesigner/MapLayerDesigner'
import EditorToolButtons from './EditorToolButtons'
import IsochroneLegendHelper from '../Map/IsochroneLegendHelper'

import Reflux from '../Rehydrate'
import type { UserStoreState } from '../../stores/UserStore'
import type { MapMakerStoreState } from '../../stores/MapMakerStore'
import type { Layer } from '../../types/layer'
import DataEditorContainer from '../Map/containers/DataEditorContainer'
import MapContainer from '../Map/containers/MapContainer'
import BaseMapContainer from '../Map/containers/BaseMapContainer'
import { subscribe } from '../Map/containers/unstated-props'
import BaseMapSelection from '../Map/ToolPanels/BaseMapSelection'
import slugify from 'slugify'
import getConfig from 'next/config'
import { LocalizedString } from '../../types/LocalizedString'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig
const { confirm } = Modal
const TabPane = Tabs.TabPane
type Props = {
  edit: boolean
  mapLayers: Array<Layer>
  showVisibility: boolean
  onCreate: (...args: Array<any>) => any
  myLayers: Array<Layer>
  popularLayers: Array<Layer>
  title?: LocalizedString
  position?: Record<string, any>
  basemap?: string
  map_id?: number
  owned_by_group_id?: string
  editLayer?: Layer
  mapConfig: Record<string, any>
  settings: Record<string, any>
  groups: Array<Record<string, any>>
  containers: {
    dataEditorState: Record<string, any>
    mapState: Record<string, any>
    baseMapState: Record<string, any>
  }
}
type State = {
  showMapLayerDesigner: boolean
  layerDesignerLayer?: Layer
  canSave: boolean
  editLayerLoaded: boolean
  saved: boolean
  activeTab: string
  showAddLayer?: boolean
} & MapMakerStoreState &
  UserStoreState

class MapMaker extends React.Component<Props, State> {
  static defaultProps = {
    edit: false,
    popularLayers: [],
    showVisibility: true,
    mapLayers: [],
    showTitleEdit: true,
    settings: {}
  }
  state: State = {
    showMapLayerDesigner: false,
    canSave: false,
    editLayerLoaded: false,
    saved: false,
    activeTab: 'overlays'
  }

  stores
  any
  constructor(props: Props) {
    super(props)
    this.stores = [MapMakerStore, UserStore]
    Reflux.rehydrate(MapMakerStore, {
      position: props.position,
      title: props.title,
      map_id: props.map_id,
      owned_by_group_id: props.owned_by_group_id,
      showAddLayer: false // if we want it to open on first load then !props.edit
    })
  }

  componentDidMount(): void {
    const { mapLayers, basemap, settings } = this.props

    if (mapLayers) {
      Actions.setMapLayers(mapLayers)
    }

    if (basemap) {
      Actions.setMapBasemap(basemap)
    }

    if (settings) {
      Actions.setSettings(settings)
    }
  }

  componentWillReceiveProps(nextProps: Props): void {
    if (!_isEqual(nextProps.position, this.props.position)) {
      Actions.setMapPosition(nextProps.position)
    }
  }

  initEditLayer = (): void => {
    if (!this.state.editLayerLoaded && this.props.editLayer) {
      this.addLayer(this.props.editLayer)
      this.editLayer(this.props.editLayer)
      this.setState({
        editLayerLoaded: true
      })
    }
  }
  onClose = (): void => {
    Actions.closeMapDesigner()
  }
  onCancel = (): void => {
    const { t, onClose } = this
    confirm({
      title: t('Confirm Cancel'),
      content: t(
        'Your map has not been saved, please confirm that you want to cancel your map.'
      ),
      okText: t('Cancel Map'),
      okType: 'danger',
      cancelText: t('Return to Editing Map'),

      onOk() {
        onClose()
      }
    })
  }
  onCreate = (): void => {
    this.setState({
      saved: true
    })
    const { onCreate } = this.props
    const { map_id, title } = this.state
    if (onCreate) onCreate(map_id, title)
  }
  privacyCheck = (isPrivate: boolean, groupId: string) => {
    // check if layers meet privacy rules, before sending a request to the server that will fail...
    const { t, state } = this
    const { mapLayers } = state

    if (isPrivate) {
      if (!groupId) {
        return t('Private map must be saved to a group')
      }

      // check all layers are in the same group
      let privateLayerInOtherGroup = false

      if (mapLayers) {
        for (const layer of mapLayers) {
          if (layer.private && layer.owned_by_group_id !== groupId) {
            privateLayerInOtherGroup = true
          }
        }
      }

      if (privateLayerInOtherGroup) {
        return t(
          'Private layers must belong to the same group that owns the map. Change the group where you are saving the map or remove the private layer.'
        )
      }
    } else {
      // check that no private layers are included
      let privateLayerInPublicMap = false

      if (mapLayers) {
        for (const layer of mapLayers) {
          if (layer.private) {
            privateLayerInPublicMap = true
          }
        }
      }

      if (privateLayerInPublicMap) {
        return t(
          'A public map cannot contain private layers. Please save as a private map owned by your group, or remove the private layer'
        )
      }
    }
  }
  onSave = (model: Record<string, any>, cb: (...args: Array<any>) => any) => {
    const { t, props, state, onCreate } = this
    const { map_id, _csrf } = state
    const { containers } = props

    const { mapState, baseMapState } = containers
    const position = mapState.state.map.getPosition()
    position.bbox = mapState.state.map.getBounds()
    if (model.private === undefined) model.private = false
    const err = this.privacyCheck(model.private, model.group)

    if (err) {
      notification.error({
        message: t('Error'),
        description: err.message || err.toString() || err,
        duration: 0
      })
    } else {
      const basemap = baseMapState.state.baseMap

      if (!map_id || map_id === -1) {
        Actions.createMap(
          model.title,
          position,
          basemap,
          model.group,
          model.private,
          _csrf,
          (err) => {
            cb()

            if (err) {
              // display error to user
              notification.error({
                message: t('Error'),
                description: err.message || err.toString() || err,
                duration: 0
              })
            } else {
              // hide designer
              message.success(t('Map Saved'))

              onCreate()
            }
          }
        )
      } else {
        Actions.saveMap(model.title, position, basemap, _csrf, (err) => {
          cb()

          if (err) {
            notification.error({
              message: t('Error'),
              description: err.message || err.toString() || err,
              duration: 0
            })
          } else {
            // hide designer
            message.success(t('Map Saved'))

            onCreate()
          }
        })
      }
    }
  }
  onDelete = (): void => {
    const { t, props, state } = this
    const { _csrf } = state
    const { title, map_id } = props

    confirm({
      title: t('Confirm Deletion'),
      content: t('Please confirm deletion of ') + t(title),
      okText: t('Delete'),
      okType: 'danger',

      onOk() {
        Actions.deleteMap(map_id, _csrf, (err) => {
          if (err) {
            notification.error({
              message: t('Error'),
              description: err.message || err.toString() || err,
              duration: 0
            })
          } else {
            window.location.assign('/maps')
          }
        })
      }
    })
  }
  toggleVisibility = (layerId: number) => {
    Actions.toggleVisibility(layerId, () => {})
  }
  showLayerDesigner = (layerId: number) => {
    const layer = _find(this.state.mapLayers, {
      layer_id: layerId
    })

    this.setState({
      showMapLayerDesigner: true,
      layerDesignerLayer: layer
    })
  }
  onLayerStyleChange = (
    layerId: number,
    style: Record<string, any>,
    labels: Record<string, any>,
    legend: Record<string, any>
  ) => {
    Actions.updateLayerStyle(layerId, style, labels, legend, (updatedLayer) => {
      this.setState({
        showMapLayerDesigner: true,
        layerDesignerLayer: updatedLayer
      })
    })
  }
  closeLayerDesigner = (): void => {
    this.setState({
      showMapLayerDesigner: false,
      layerDesignerLayer: undefined
    })
  }
  removeFromMap = (layer: Layer): void => {
    Actions.removeFromMap(layer)
  }
  addLayer = (layer: Layer): void => {
    const { t, props, state } = this
    const { mapLayers } = state
    const { containers } = props
    const { mapState } = containers
    // clone the layer object so we don't mutate the data in the search results
    layer = JSON.parse(JSON.stringify(layer))

    if (mapState.state.map) {
      if (mapLayers && mapLayers.length === 0 && layer.extent_bbox) {
        mapState.state.map.fitBounds(layer.extent_bbox, 16, 25, false)
      }

      const position = mapState.state.map.getPosition()
      position.bounds = mapState.state.map.getBounds()
      Actions.setMapPosition(position)
    }

    if (
      _find(mapLayers, {
        layer_id: layer.layer_id
      })
    ) {
      message.warning(t('Map already contains this layer'), 3)
    } else {
      Actions.addToMap(layer)
      // close add layer drawer
      this.setState({
        showAddLayer: false
      })
    }
  }
  editLayer = (layer: Layer) => {
    const { dataEditorState, mapState } = this.props.containers
    Actions.startEditing()
    dataEditorState.startEditing(layer)
    mapState.state.map.startEditingTool(layer)
    this.setState({
      activeTab: 'editing'
    })
  }
  stopEditingLayer = () => {
    const { mapState } = this.props.containers
    Actions.stopEditing()
    mapState.state.map.stopEditingTool()
    this.setState({
      activeTab: 'overlays'
    })
  }
  changeBaseMap = async (mapName: string) => {
    const { mapState, baseMapState } = this.props.containers
    const baseMapStyle = await baseMapState.setBaseMap(mapName)
    this.setState({
      allowLayersToMoveMap: false
    })
    mapState.state.map.setBaseMapStyle(baseMapStyle, true)

    if (mapState.state.insetMap) {
      mapState.state.insetMap.reloadInset(baseMapStyle)
      mapState.state.insetMap.sync(mapState.state.map)
    }

    Actions.setMapBasemap(mapName)
  }
  onToggleIsochroneLayer = (enabled: boolean) => {
    let mapLayers = this.state.mapLayers ? this.state.mapLayers : []
    const layers = IsochroneLegendHelper.getLegendLayers()

    if (enabled) {
      // add layers to legend
      mapLayers = mapLayers.concat(layers)
    } else {
      const updatedLayers = []
      // remove layers from legend
      for (const mapLayer of mapLayers) {
        let foundInLayers
        for (const layer of layers) {
          if (mapLayer.layer_id === layer.layer_id) {
            foundInLayers = true
          }
        }

        if (!foundInLayers) {
          updatedLayers.push(mapLayer)
        }
      }
      mapLayers = updatedLayers
    }

    Actions.setMapLayers(mapLayers, false)
  }

  render() {
    const {
      editLayer,
      toggleVisibility,
      removeFromMap,
      showLayerDesigner,
      t,
      props,
      state,
      closeLayerDesigner,
      onLayerStyleChange,
      changeBaseMap,
      onDelete,
      onSave,
      onToggleIsochroneLayer,
      initEditLayer,
      stopEditingLayer,
      addLayer
    } = this
    const {
      showVisibility,
      containers,
      edit,
      mapConfig,
      groups,
      myLayers,
      popularLayers
    } = props
    const {
      map_id,
      title,
      showMapLayerDesigner,
      layerDesignerLayer,
      position,
      mapLayers,
      mapStyle,
      editingLayer,
      showAddLayer,
      activeTab,
      settings,
      _csrf,
      locale
    } = state
    const { mapState } = containers
    if (!Array.isArray(mapLayers)) return ''
    let mapExtent

    if (position && position.bbox) {
      const bbox = position.bbox
      mapExtent = [bbox[0][0], bbox[0][1], bbox[1][0], bbox[1][1]]
    }

    return (
      <Row
        style={{
          width: '100%',
          height: '100%'
        }}
      >
        <Col
          sm={12}
          md={8}
          lg={6}
          style={{
            height: '100%'
          }}
        >
          {showMapLayerDesigner && (
            <Drawer
              title={t(layerDesignerLayer.name)}
              placement='left'
              width='350px'
              closable
              destroyOnClose
              bodyStyle={{
                height: 'calc(100vh - 55px)',
                padding: '0px'
              }}
              onClose={closeLayerDesigner}
              visible
              mask={false}
            >
              <Row
                style={{
                  height: 'calc(100% - 55px)',
                  marginBottom: '10px'
                }}
              >
                <MapLayerDesigner
                  ref='LayerDesigner'
                  layer={layerDesignerLayer}
                  onStyleChange={onLayerStyleChange}
                  onClose={closeLayerDesigner}
                />
              </Row>
              <Row
                justify='center'
                align='middle'
                style={{
                  textAlign: 'center'
                }}
              >
                <Button type='primary' onClick={closeLayerDesigner}>
                  {t('Close')}
                </Button>
              </Row>
            </Drawer>
          )}
          <style jsx global>
            {`
              .ant-tabs-content {
                height: 100%;
                width: 100%;
              }
              .ant-tabs-tabpane {
                height: 100%;
              }

              .ant-tabs > .ant-tabs-content > .ant-tabs-tabpane-inactive {
                display: none;
              }

              .ant-tabs-bar {
                padding-left: 3px;
                margin: 0;
              }
            `}
          </style>
          <Tabs
            defaultActiveKey='overlays'
            style={{
              height: 'calc(100% - 50px)'
            }}
            tabBarStyle={{
              marginBottom: 0
            }}
            animated={false}
            activeKey={activeTab}
            onChange={(activeTab) => {
              this.setState({
                activeTab
              })
            }}
          >
            <TabPane
              tab={t('Base Map')}
              key='basemap'
              style={{
                height: '100%'
              }}
            >
              <BaseMapSelection onChange={changeBaseMap} t={t} />
            </TabPane>
            <TabPane
              tab={t('Layers')}
              key='overlays'
              style={{
                height: '100%'
              }}
            >
              <Row
                style={{
                  height: 'calc(100% - 100px)',
                  width: '100%'
                }}
              >
                <LayerList
                  layers={mapLayers}
                  showVisibility={showVisibility}
                  showRemove
                  showDesign
                  showInfo
                  showEdit={!editingLayer}
                  toggleVisibility={toggleVisibility}
                  removeFromMap={removeFromMap}
                  showLayerDesigner={showLayerDesigner}
                  updateLayers={Actions.setMapLayers}
                  editLayer={editLayer}
                  openAddLayer={() => {
                    this.setState({
                      showAddLayer: true
                    })
                  }}
                  t={t}
                />
              </Row>
              <Row
                style={{
                  height: '50px',
                  textAlign: 'center',
                  width: '100%'
                }}
              >
                <Button
                  style={{
                    margin: 'auto'
                  }}
                  type='primary'
                  onClick={() => {
                    this.setState({
                      showAddLayer: true
                    })
                  }}
                >
                  {t('Add Layer')}
                </Button>
              </Row>
            </TabPane>
            {editingLayer && (
              <TabPane
                tab={t('Editing')}
                key='editing'
                style={{
                  height: '100%'
                }}
              >
                <EditLayerPanel t={t} />
              </TabPane>
            )}
          </Tabs>
          <hr
            style={{
              margin: 0
            }}
          />
          <Row
            justify='center'
            align='middle'
            style={{
              width: '100%',
              height: '50px',
              padding: '0px 10px'
            }}
          >
            <Col span={10}>
              <Row
                justify='space-around'
                align='middle'
                style={{
                  width: '100%',
                  height: '50px'
                }}
              >
                <Col span={8}>
                  <MapSettingsPanel />
                </Col>
                <Col span={8}>
                  <Tooltip
                    title={
                      map_id
                        ? t('Export MapHubs File')
                        : t('Download MapHubs File')
                    }
                    placement='top'
                  >
                    <Button
                      download
                      href={`/api/mapexport/${map_id}/${slugify(
                        t(title || 'New Map')
                      )}.maphubs`}
                      icon={<DownloadOutlined />}
                      style={{
                        marginRight: '10px'
                      }}
                    />
                  </Tooltip>
                </Col>
                <Col span={8}>
                  <Tooltip title={t('Delete Map')} placement='top'>
                    <Button
                      danger
                      onClick={onDelete}
                      icon={<DeleteOutlined />}
                      style={{
                        marginRight: '10px'
                      }}
                    />
                  </Tooltip>
                </Col>
              </Row>
            </Col>
            <Col
              span={14}
              style={{
                textAlign: 'right'
              }}
            >
              <SaveMapModal
                {...state}
                initialTitle={state.title}
                editing={edit}
                onSave={onSave}
                _csrf={_csrf}
              />
            </Col>
          </Row>
        </Col>
        <Col
          sm={12}
          md={16}
          lg={18}
          style={{
            height: '100%'
          }}
        >
          {mapStyle && mapStyle.layers && mapStyle.sources && (
            <Row
              style={{
                height: '100%',
                width: '100%',
                margin: 0,
                position: 'relative'
              }}
            >
              <Map
                id='create-map-map'
                style={{
                  height: '100%',
                  width: '100%',
                  margin: 'auto'
                }}
                glStyle={mapStyle}
                insetMap
                insetConfig={settings ? settings.insetConfig : undefined}
                onChangeBaseMap={Actions.setMapBasemap}
                onToggleIsochroneLayer={onToggleIsochroneLayer}
                fitBounds={mapExtent}
                mapConfig={mapConfig}
                onLoad={initEditLayer}
                hash
                primaryColor={MAPHUBS_CONFIG.primaryColor}
                logoSmall={MAPHUBS_CONFIG.logoSmall}
                logoSmallHeight={MAPHUBS_CONFIG.logoSmallHeight}
                logoSmallWidth={MAPHUBS_CONFIG.logoSmallWidth}
                t={t}
                locale={locale}
                mapboxAccessToken={MAPHUBS_CONFIG.MAPBOX_ACCESS_TOKEN}
                DGWMSConnectID={MAPHUBS_CONFIG.DG_WMS_CONNECT_ID}
                earthEngineClientID={MAPHUBS_CONFIG.EARTHENGINE_CLIENTID}
              >
                {editingLayer && (
                  <EditorToolButtons
                    stopEditingLayer={stopEditingLayer}
                    onFeatureUpdate={mapState.state.map.onFeatureUpdate}
                  />
                )}
              </Map>

              <MiniLegend
                style={{
                  position: 'absolute',
                  top: '5px',
                  left: '5px',
                  minWidth: '200px',
                  width: '25%'
                }}
                layers={mapLayers}
                maxHeight='calc(100vh - 300px)'
                hideInactive
                showLayersButton={false}
              />
            </Row>
          )}
        </Col>
        <Drawer
          title={t('Add Layer')}
          placement='bottom'
          height='100vh'
          closable
          destroyOnClose
          bodyStyle={{
            height: 'calc(100vh - 55px)',
            padding: '0px'
          }}
          onClose={() => {
            this.setState({
              showAddLayer: false
            })
          }}
          visible={showAddLayer}
        >
          <AddLayerPanel
            myLayers={myLayers}
            popularLayers={popularLayers}
            groups={groups}
            onAdd={addLayer}
            t={t}
          />
        </Drawer>
      </Row>
    )
  }
}

export default subscribe(MapMaker, {
  dataEditorState: DataEditorContainer,
  mapState: MapContainer,
  baseMapState: BaseMapContainer
}) as any
