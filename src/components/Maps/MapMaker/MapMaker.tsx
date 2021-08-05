import React, { useState, useEffect } from 'react'
import LayerList from '../Map/LayerList'
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
import EditLayerPanel from './EditLayerPanel'
import MapLayerDesigner from '../../LayerDesigner/MapLayerDesigner'
import EditorToolButtons from './EditorToolButtons'
import IsochroneLegendHelper from '../Map/IsochroneLegendHelper'

import type { Layer } from '../../../types/layer'
import BaseMapSelection from '../Map/ToolPanels/BaseMapSelection'
import slugify from 'slugify'
import useT from '../../../hooks/useT'

import { LocalizedString } from '../../../types/LocalizedString'

import { useDispatch, useSelector } from '../redux/hooks'
import {
  initMapMaker,
  removeFromMap,
  setMapLayers,
  createMap,
  saveMap,
  toggleVisibility,
  updateLayerStyle,
  addToMap,
  setMapPosition,
  MapMakerState
} from '../redux/reducers/mapMakerSlice'
import { MapPosition } from '../../../types/map'
import mapboxgl from 'mapbox-gl'

const { confirm } = Modal
const TabPane = Tabs.TabPane
type Props = {
  edit?: boolean
  mapLayers: Array<Layer>
  showVisibility: boolean
  onCreate: ({
    group_id,
    title,
    position,
    basemap
  }: {
    group_id: string
    title: LocalizedString
    position: MapPosition
    basemap: string
  }) => Promise<{ map_id: number }>
  onSave: ({
    map_id,
    title,
    position,
    basemap
  }: {
    map_id: number
    title: LocalizedString
    position: MapPosition
    basemap: string
  }) => Promise<boolean>
  onDelete: (map_id: number) => Promise<boolean>
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

const MapMaker = (props: Props): JSX.Element => {
  const { t } = useT()
  const dispatch = useDispatch()
  const [layerDesignerLayer, setLayerDesignerLayer] = useState<Layer>(null)
  const [canSave, setCanSave] = useState(false)
  const [editLayerLoaded, setEditLayerLoaded] = useState(false)
  const [activeTab, setActiveTab] = useState('overlays')
  const [showAddLayer, setShowAddLayer] = useState(false)

  /*
  constructor(props: Props) {
    super(props)
    this.stores = [MapMakerStore]
    Reflux.rehydrate(MapMakerStore, {
      position: props.position,
      title: props.title,
      map_id: props.map_id,
      owned_by_group_id: props.owned_by_group_id,
      showAddLayer: false // if we want it to open on first load then !props.edit
    })
  }
  */

  useEffect(() => {
    //* init redux from props
    dispatch(
      initMapMaker({
        map_id: props.map_id,
        title: props.title,
        mapLayers: props.mapLayers,
        position: props.position,
        settings: props.settings,
        owned_by_group_id: props.owned_by_group_id,
        basemap: props.basemap
      })
    )
    dispatch(initBaseMap({ basemap: props.basemap }))
  }, [
    dispatch,
    props.map_id,
    props.title,
    props.mapLayers,
    props.position,
    props.settings,
    props.owned_by_group_id,
    props.basemap
  ])

  //? selecting these seperately optimizes re-rendering
  const map_id = useSelector(
    (state: { mapMaker: MapMakerState }) => state.mapMaker.map_id
  )
  const owned_by_group_id = useSelector(
    (state: { mapMaker: MapMakerState }) => state.mapMaker.owned_by_group_id
  )
  const mapStyle = useSelector(
    (state: { mapMaker: MapMakerState }) => state.mapMaker.mapStyle
  )
  const mapLayers = useSelector(
    (state: { mapMaker: MapMakerState }) => state.mapMaker.mapLayers
  )
  const title = useSelector(
    (state: { mapMaker: MapMakerState }) => state.mapMaker.title
  )
  const position = useSelector(
    (state: { mapMaker: MapMakerState }) => state.mapMaker.position
  )
  const settings = useSelector(
    (state: { mapMaker: MapMakerState }) => state.mapMaker.settings
  )
  const editingLayer = useSelector(
    (state: { mapMaker: MapMakerState }) => state.mapMaker.editingLayer
  )

  useEffect(() => {
    //? Update position from props, is this needed?
    // Actions.setMapPosition(nextProps.position)
  }, [position])

  const initEditLayer = (): void => {
    if (!editLayerLoaded && editLayer) {
      addLayer(editLayer)
      editLayer(editLayer)
      setEditLayerLoaded(true)
    }
  }

  const onSave = async (
    model: Record<string, any>,
    cb: (...args: Array<any>) => any
  ) => {
    // get position from the map
    const position = mapState.state.map.getPosition()
    position.bbox = mapState.state.map.getBounds()
    // get basemap from basemap store
    const basemap = baseMapState.state.baseMap

    if (!map_id || map_id === -1) {
      // callback to the page so it can save to the db
      const result = await props.onCreate({
        title: model.title,
        position,
        basemap,
        group_id: model.group
      })
      // dispatch the create action
      dispatch(
        createMap({
          map_id: result.map_id,
          title: model.title,
          position,
          group_id: model.group
        })
      )

      /*
        Actions.createMap(
          model.title,
          position,
          basemap,
          model.group
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
              if (onCreate) onCreate(map_id, title)
            }
          }
        )
        */
    } else {
      await props.onSave({
        map_id,
        title: model.title,
        position,
        basemap
      })

      dispatch(
        saveMap({
          title: model.title,
          position
        })
      )
    }
    message.success(t('Map Saved'))
  }

  const showLayerDesigner = (layerId: number) => {
    const layer = _find(mapLayers, {
      layer_id: layerId
    })
    setLayerDesignerLayer(layer)
  }

  const onLayerStyleChange = (
    layer_id: number,
    style: mapboxgl.Style,
    labels: Record<string, any>,
    legend: string
  ) => {
    dispatch(updateLayerStyle({ layer_id, style, labels, legend }))
    // TODO: move layer designer layer to redux to avoid a side-effect here
    //setLayerDesignerLayer(updatedLayer)
  }
  const closeLayerDesigner = (): void => {
    setLayerDesignerLayer(null)
  }

  const addLayer = (layer: Layer): void => {
    // clone the layer object so we don't mutate the data in the search results
    layer = JSON.parse(JSON.stringify(layer))

    if (mapState.state.map) {
      if (mapLayers && mapLayers.length === 0 && layer.extent_bbox) {
        mapState.state.map.fitBounds(layer.extent_bbox, 16, 25, false)
      }

      const position = mapState.state.map.getPosition()
      position.bounds = mapState.state.map.getBounds()
      dispatch(setMapPosition({ position }))
    }

    if (
      _find(mapLayers, {
        layer_id: layer.layer_id
      })
    ) {
      message.warning(t('Map already contains this layer'), 3)
    } else {
      dispatch(addToMap({ layer }))
      // close add layer drawer
      setShowAddLayer(false)
    }
  }
  const editLayer = (layer: Layer) => {
    Actions.startEditing()
    dataEditorState.startEditing(layer)
    mapState.state.map.startEditingTool(layer)
    setActiveTab('editing')
  }
  const stopEditingLayer = () => {
    Actions.stopEditing()
    mapState.state.map.stopEditingTool()
    setActiveTab('overlays')
  }
  const changeBaseMap = async (mapName: string) => {
    const baseMapStyle = await baseMapState.setBaseMap(mapName)

    mapState.state.map.setBaseMapStyle(baseMapStyle, true)

    if (mapState.state.insetMap) {
      mapState.state.insetMap.reloadInset(baseMapStyle)
      mapState.state.insetMap.sync(mapState.state.map)
    }

    Actions.setMapBasemap(mapName)
  }
  const onToggleIsochroneLayer = (enabled: boolean) => {
    let mapLayers = mapState.mapLayers || []
    const layers = IsochroneLegendHelper.getLegendLayers()

    if (enabled) {
      // add layers to legend
      mapLayers = [...mapLayers, ...layers]
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
    dispatch(setMapLayers({ mapLayers, skipUpdate: true }))
  }

  if (!Array.isArray(mapLayers)) return <></>
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
        {layerDesignerLayer && (
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
            setActiveTab(activeTab)
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
                toggleVisibility={(layer_id: number) => {
                  dispatch(toggleVisibility({ layer_id }))
                }}
                removeFromMap={(layer: Layer) => {
                  dispatch(removeFromMap({ layer }))
                }}
                showLayerDesigner={showLayerDesigner}
                updateLayers={(layers: Layer[]) => {
                  dispatch(setMapLayers({ mapLayers: layers }))
                }}
                editLayer={editLayer}
                openAddLayer={() => {
                  setShowAddLayer(true)
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
                  setShowAddLayer(true)
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
                    onClick={() => {
                      confirm({
                        title: t('Confirm Deletion'),
                        content: t('Please confirm deletion of ') + t(title),
                        okText: t('Delete'),
                        okType: 'danger',

                        onOk() {
                          props.onDelete(map_id)
                        }
                      })
                    }}
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
              owned_by_group_id={owned_by_group_id}
              editingLayer={editingLayer}
              initialTitle={title}
              editing={edit}
              onSave={onSave}
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
              onChangeBaseMap={(basemap) => {
                dispatch(setMapBasemap({ basemap }))
              }}
              onToggleIsochroneLayer={onToggleIsochroneLayer}
              fitBounds={mapExtent}
              mapConfig={mapConfig}
              onLoad={initEditLayer}
              hash
              primaryColor={process.env.NEXT_PUBLIC_PRIMARY_COLOR}
              t={t}
              locale={locale}
              mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
              DGWMSConnectID={process.env.NEXT_PUBLIC_DG_WMS_CONNECT_ID}
              earthEngineClientID={process.env.NEXT_PUBLIC_EARTHENGINE_CLIENTID}
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
          setShowAddLayer(false)
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

MapMaker.defaultProps = {
  popularLayers: [],
  showVisibility: true,
  mapLayers: [],
  showTitleEdit: true,
  settings: {}
}
export default MapMaker
