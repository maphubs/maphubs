import React, { useState, useEffect, useRef } from 'react'
import LayerList from '../Map/LayerList'
import _find from 'lodash.find'
import { Drawer, Button, Row, Col, Tabs, Modal, message, Tooltip } from 'antd'
import { DeleteOutlined, DownloadOutlined } from '@ant-design/icons'
import Map from '../Map'
import MiniLegend from '../Map/MiniLegend'
import AddLayerPanel from './AddLayerPanel'
import SaveMapModal from './SaveMapModal'
import MapSettingsPanel from './MapSettingsPanel'
import EditLayerPanel from './EditLayerPanel'
import MapLayerDesigner from '../../LayerDesigner/MapLayerDesigner'
import EditorToolButtons from './EditorToolButtons'

import type { Layer } from '../../../types/layer'
import BaseMapSelection from '../Map/ToolPanels/BaseMapSelection'
import slugify from 'slugify'
import useMapT from '../hooks/useMapT'

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
  setMapPosition
} from '../redux/reducers/mapMakerSlice'
import {
  selectMapboxMap,
  setEnableMeasurementTools
} from '../redux/reducers/mapSlice'
import {
  startEditing,
  stopEditing,
  updateFeatures,
  createFeature,
  deleteFeature,
  selectFeatureThunk
} from '../redux/reducers/dataEditorSlice'
import { setBaseMapThunk } from '../redux/reducers/baseMapSlice'
import { reloadStyleThunk } from '../redux/reducers/map/reloadStyleThunk'
import { setBaseMapStyleThunk } from '../redux/reducers/map/setBaseMapStyleThunk'

import { MapPosition } from '../../../types/map'
import mapboxgl from 'mapbox-gl'
import drawTheme from '@mapbox/mapbox-gl-draw/src/lib/theme'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
//import 'jquery'
import DebugService from '../lib/debug'
import { Group } from '../../../types/group'

const debug = DebugService('MapMaker')

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
  groups: Group[]
  containers: {
    dataEditorState: Record<string, any>
    mapState: Record<string, any>
    baseMapState: Record<string, any>
  }
  locale: string
}

const MapMaker = (props: Props): JSX.Element => {
  const { t } = useMapT()
  const dispatch = useDispatch()
  const [layerDesignerLayer, setLayerDesignerLayer] = useState<Layer>(null)
  const [canSave, setCanSave] = useState(false)
  const [activeTab, setActiveTab] = useState('overlays')
  const [showAddLayer, setShowAddLayer] = useState(false)

  //editing
  const drawRef = useRef<MapboxDraw>()
  const [editLayerLoaded, setEditLayerLoaded] = useState(false)

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

  //* map maker state
  const map_id = useSelector((state) => state.mapMaker.map_id)
  const owned_by_group_id = useSelector(
    (state) => state.mapMaker.owned_by_group_id
  )
  const mapStyle = useSelector((state) => state.mapMaker.mapStyle)
  const mapLayers = useSelector((state) => state.mapMaker.mapLayers)
  const title = useSelector((state) => state.mapMaker.title)
  const position = useSelector((state) => state.mapMaker.position)
  const settings = useSelector((state) => state.mapMaker.settings)

  //* map state
  const mapboxMap = useSelector(selectMapboxMap)
  const basemap = useSelector((state) => state.baseMap.baseMap)
  const enableMeasurementTools = useSelector(
    (state) => state.map.enableMeasurementTools
  )

  const overlayMapStyle = useSelector((state) => state.map.overlayMapStyle)
  const glStyle = useSelector((state) => state.map.glStyle)

  useEffect(() => {
    //? Update position from props, is this needed?
    // Actions.setMapPosition(nextProps.position)
  }, [position])

  const editingLayer = useSelector((state) => state.dataEditor.editingLayer)
  const edits = useSelector((state) => state.dataEditor.edits)
  const originals = useSelector((state) => state.dataEditor.originals)
  const clickedFeature = useSelector((state) => state.dataEditor.clickedFeature)

  //* Enable editing for a feature */

  useEffect(() => {
    /**
     * Add filter to hide vector tile versions of features active in the drawing tool
     *
     */
    const updateMapLayerFilters = () => {
      const layerId = editingLayer.layer_id
      const shortid = editingLayer.shortid
      // build a new filter
      const uniqueIds = []

      if (edits) {
        for (const edit of edits) {
          const mhid = edit.geojson.id

          if (mhid && !uniqueIds.includes(mhid)) {
            uniqueIds.push(mhid)
          }
        }
      }

      if (originals) {
        for (const orig of originals) {
          const mhid = orig.geojson.id

          if (mhid && !uniqueIds.includes(mhid)) {
            uniqueIds.push(mhid)
          }
        }
      }

      const hideEditingFilter = ['!in', 'mhid', ...uniqueIds]

      if (overlayMapStyle) {
        const layers = overlayMapStyle.layers as Array<
          mapboxgl.Layer & { metadata: Record<string, unknown> }
        >
        for (const layer of layers) {
          // check if the layer_id matches
          let foundMatch

          if (layer.metadata && layer.metadata['maphubs:layer_id']) {
            if (layer.metadata['maphubs:layer_id'] === layerId) {
              foundMatch = true
            }
          } else if (layer.id.endsWith(shortid)) {
            foundMatch = true
          }

          if (foundMatch) {
            // get current filter
            let filter = layer.filter

            if (!filter || !Array.isArray(filter) || filter.length === 0) {
              // create a new filter
              filter = hideEditingFilter
            } else if (filter[0] === 'all') {
              // add our condition to the end
              filter = [...layer.filter, ...hideEditingFilter]
            } else {
              filter = ['all', filter, hideEditingFilter]
            }

            mapboxMap.setFilter(layer.id, filter)
          }
        }
      }
    }
    if (
      clickedFeature &&
      drawRef.current &&
      !drawRef.current.get(clickedFeature.id)
    ) {
      // if not already editing this feature
      debug.log('adding feature to mapbox-gl-draw')
      drawRef.current.add(clickedFeature)
      updateMapLayerFilters()
    }
  }, [
    clickedFeature,
    editingLayer,
    mapboxMap,
    edits,
    originals,
    overlayMapStyle
  ])

  const initEditLayer = (): void => {
    if (!editLayerLoaded && props.editLayer) {
      addLayer(props.editLayer)
      editLayer(props.editLayer)
      setEditLayerLoaded(true)
    }
  }

  const onSave = async (
    model: Record<string, any>,
    cb: (...args: Array<any>) => any
  ) => {
    // get position from the map
    const center = mapboxMap.getCenter()
    const position = {
      zoom: mapboxMap.getZoom(),
      lng: center.lng,
      lat: center.lat,
      bbox: mapboxMap.getBounds().toArray()
    }

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

    if (mapboxMap) {
      if (mapLayers && mapLayers.length === 0 && layer.extent_bbox) {
        mapboxMap.fitBounds(layer.extent_bbox, {
          padding: 25,
          curve: 1,
          speed: 0.6,
          maxZoom: 16,
          animate: false
        })
      }

      const center = mapboxMap.getCenter()
      const position = {
        zoom: mapboxMap.getZoom(),
        lng: center.lng,
        lat: center.lat,
        bbox: mapboxMap.getBounds().toArray()
      }
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

  const updateEdits = (e: any) => {
    if (e.features.length > 0) {
      dispatch(updateFeatures(e.features))
    }
  }

  const editLayer = (layer: Layer) => {
    dispatch(startEditing({ layer }))
    setActiveTab('editing')

    if (enableMeasurementTools) {
      dispatch(setEnableMeasurementTools(false)) // close measurement tool if open
    }

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        point: layer.data_type === 'point',
        polygon: layer.data_type === 'polygon',
        line_string: layer.data_type === 'line',
        trash: true
      },
      styles: drawTheme
    })
    drawRef.current = draw
    mapboxMap.addControl(draw, 'top-right')
    mapboxMap.on('draw.create', (e) => {
      debug.log('draw create')
      const features = e.features

      if (features && features.length > 0) {
        for (const feature of features) {
          dispatch(createFeature(feature))
        }
      }
    })
    mapboxMap.on('draw.update', (e) => {
      debug.log('draw update')
      updateEdits(e)
    })
    mapboxMap.on('draw.delete', (e) => {
      debug.log('draw delete')
      const features = e.features

      if (features && features.length > 0) {
        for (const feature of features) {
          dispatch(deleteFeature(feature))
        }
      }
    })
    mapboxMap.on('draw.selectionchange', async (e) => {
      debug.log('draw selection')
      // if in simple mode (e.g. not selecting vertices) then check if selected feature changed
      const mode = drawRef.current.getMode()

      if (mode === 'simple_select') {
        const features = e.features

        if (features && features.length > 0) {
          await Promise.all(
            features.map((feature) => {
              dispatch(selectFeatureThunk(feature.id))
            })
          )
        }
      }
    })
  }

  const removeMapLayerFilters = () => {
    if (!editingLayer || !editingLayer.layer_id) {
      debug.error('unable to find editing layer')
      return
    }

    const layerId = editingLayer.layer_id

    if (glStyle?.layers) {
      const layers = glStyle.layers as Array<
        mapboxgl.Layer & { metadata: Record<string, unknown> }
      >
      for (const layer of layers) {
        // check if the layer_id matches
        let foundMatch

        if (layer.metadata && layer.metadata['maphubs:layer_id']) {
          if (layer.metadata['maphubs:layer_id'] === layerId) {
            foundMatch = true
          }
        } else if (layer.id.endsWith(layerId.toString())) {
          foundMatch = true
        }

        if (foundMatch) {
          // get current filter
          let filter = layer.filter

          if (!filter || !Array.isArray(filter) || filter.length === 0) {
            // do nothing
          } else if (filter[0] === 'all') {
            // remove our filter from the end
            filter = layer.filter.pop()
          } else {
            filter = undefined
          }

          mapboxMap.setFilter(layer.id, filter)
        }
      }
    }
  }

  const stopEditingLayer = () => {
    dispatch(stopEditing())
    setActiveTab('overlays')
    mapboxMap.removeControl(drawRef.current)
    removeMapLayerFilters()

    //reload mapbox-gl source cache
    const sourceID = Object.keys(editingLayer.style.sources)[0]
    const sourceCache = mapboxMap.style.sourceCaches[sourceID]

    if (sourceCache) {
      // From: https://github.com/mapbox/mapbox-gl-js/issues/2941#issuecomment-518631078
      // Remove the tiles for a particular source
      sourceCache.clearTiles()
      // Load the new tiles for the current viewport (map.transform -> viewport)
      sourceCache.update(mapboxMap.transform)
      // Force a repaint, so that the map will be repainted without you having to touch the map
      mapboxMap.triggerRepaint()
    }
    // force a full reload of the style
    dispatch(reloadStyleThunk(true))
  }

  const changeBaseMap = async (mapName: string) => {
    debug.log(`(changing basemap from map maker: ${mapName}`)
    const result = await dispatch(setBaseMapThunk(mapName)).unwrap()
    await dispatch(
      setBaseMapStyleThunk({ style: result.baseMapStyle, skipUpdate: false })
    )
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
                layer={layerDesignerLayer}
                onStyleChange={onLayerStyleChange}
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
            <BaseMapSelection onChange={changeBaseMap} />
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
                showVisibility={props.showVisibility}
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
              <EditLayerPanel />
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
              editingLayer={!!editingLayer}
              initialTitle={title}
              editing={props.edit}
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
              initialGLStyle={mapStyle}
              insetMap
              insetConfig={settings ? settings.insetConfig : undefined}
              onChangeBaseMap={(basemap) => {
                changeBaseMap(basemap)
              }}
              fitBounds={mapExtent}
              mapConfig={props.mapConfig}
              onLoad={initEditLayer}
              hash
              locale={props.locale} //pass through props locale so Map component can set it in redux
              mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
              DGWMSConnectID={process.env.NEXT_PUBLIC_DG_WMS_CONNECT_ID}
              earthEngineClientID={process.env.NEXT_PUBLIC_EARTHENGINE_CLIENTID}
            >
              {editingLayer && (
                <EditorToolButtons
                  stopEditingLayer={stopEditingLayer}
                  onFeatureUpdate={(
                    type: string,
                    feature: Record<string, any>
                  ) => {
                    if (drawRef.current) {
                      if (type === 'update' || type === 'create') {
                        drawRef.current.add(feature.geojson)
                      } else if (type === 'delete') {
                        drawRef.current.delete(feature.geojson.id)
                      }
                    }
                  }}
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
          myLayers={props.myLayers}
          popularLayers={props.popularLayers}
          groups={props.groups}
          onAdd={addLayer}
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
  settings: {},
  basemap: 'default',
  locale: 'en'
}
export default MapMaker
