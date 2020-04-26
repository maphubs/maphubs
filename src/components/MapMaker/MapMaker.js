// @flow
import React from 'react'
import LayerList from '../Map/LayerList'
import _isEqual from 'lodash.isequal'
import _find from 'lodash.find'
import { Drawer, Button, Row, Col, Tabs, Modal, message, notification, Tooltip } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
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
import MapHubsComponent from '../MapHubsComponent'
import Reflux from '../Rehydrate'
import type {LocaleStoreState} from '../../stores/LocaleStore'
import type {UserStoreState} from '../../stores/UserStore'
import type {MapMakerStoreState} from '../../stores/MapMakerStore'
import type {Layer} from '../../types/layer'
import DataEditorContainer from '../Map/containers/DataEditorContainer'
import MapContainer from '../Map/containers/MapContainer'
import BaseMapContainer from '../Map/containers/BaseMapContainer'
import { subscribe } from '../Map/containers/unstated-props'
import BaseMapSelection from '../Map/ToolPanels/BaseMapSelection'
import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig
const { confirm } = Modal
const TabPane = Tabs.TabPane

type Props = {
    edit: boolean,
    mapLayers: Array<Layer>,
    showVisibility: boolean,
    onCreate: Function,
    myLayers: Array<Layer>,
    popularLayers: Array<Layer>,
    title?: LocalizedString,
    position?: Object,
    basemap?: string,
    map_id?: number,
    owned_by_group_id?: string,
    editLayer?: Layer,
    mapConfig: Object,
    settings: Object,
    groups: Array<Object>,
    containers: {
      dataEditorState: Object,
      mapState: Object,
      baseMapState: Object
    }
  }

  type State = {
    showMapLayerDesigner: boolean,
    layerDesignerLayer?: Layer,
    canSave: boolean,
    editLayerLoaded: boolean,
    saved: boolean,
    activeTab: string,
    showAddLayer?: boolean
  } & LocaleStoreState & MapMakerStoreState & UserStoreState

class MapMaker extends MapHubsComponent<Props, State> {
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

  constructor (props: Props) {
    super(props)
    this.stores.push(MapMakerStore)
    this.stores.push(UserStore)
    Reflux.rehydrate(MapMakerStore, {
      position: props.position,
      title: props.title,
      map_id: props.map_id,
      owned_by_group_id: props.owned_by_group_id,
      showAddLayer: false // if we want it to open on first load then !props.edit
    })
  }

  componentDidMount () {
    const {mapLayers, basemap, settings} = this.props
    if (mapLayers) { Actions.setMapLayers(mapLayers) }
    if (basemap) { Actions.setMapBasemap(basemap) }
    if (settings) { Actions.setSettings(settings) }
  }

  componentWillReceiveProps (nextProps: Props) {
    if (!_isEqual(nextProps.position, this.props.position)) {
      Actions.setMapPosition(nextProps.position)
    }
  }

  initEditLayer = () => {
    if (!this.state.editLayerLoaded && this.props.editLayer) {
      this.addLayer(this.props.editLayer)
      this.editLayer(this.props.editLayer)
      this.setState({editLayerLoaded: true})
    }
  }

  onClose = () => {
    Actions.closeMapDesigner()
  }

  onCancel = () => {
    const {t, onClose} = this
    confirm({
      title: t('Confirm Cancel'),
      content: t('Your map has not been saved, please confirm that you want to cancel your map.'),
      okText: t('Cancel Map'),
      okType: 'danger',
      cancelText: t('Return to Editing Map'),
      onOk () {
        onClose()
      }
    })
  }

  onCreate = () => {
    this.setState({saved: true})
    const {onCreate} = this.props
    const {map_id, title} = this.state
    if (onCreate) onCreate(map_id, title)
  }

   privacyCheck = (isPrivate: boolean, groupId: string) => {
     // check if layers meet privacy rules, before sending a request to the server that will fail...
     const {t} = this
     const {mapLayers} = this.state
     if (isPrivate) {
       if (!groupId) {
         return t('Private map must be saved to a group')
       }
       // check all layers are in the same group
       let privateLayerInOtherGroup = false
       if (mapLayers) {
         mapLayers.forEach((layer) => {
           if (layer.private && layer.owned_by_group_id !== groupId) {
             privateLayerInOtherGroup = true
           }
         })
       }
       if (privateLayerInOtherGroup) {
         return t('Private layers must belong to the same group that owns the map. Change the group where you are saving the map or remove the private layer.')
       }
     } else {
       // check that no private layers are included
       let privateLayerInPublicMap = false
       if (mapLayers) {
         mapLayers.forEach((layer) => {
           if (layer.private) {
             privateLayerInPublicMap = true
           }
         })
       }
       if (privateLayerInPublicMap) {
         return t('A public map cannot contain private layers. Please save as a private map owned by your group, or remove the private layer')
       }
     }
   }

  onSave = (model: Object, cb: Function) => {
    const {t} = this
    const _this = this
    const {mapState, baseMapState} = this.props.containers
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
      if (!this.state.map_id || this.state.map_id === -1) {
        Actions.createMap(model.title, position, basemap, model.group, model.private, _this.state._csrf, err => {
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
            _this.onCreate()
          }
        })
      } else {
        Actions.saveMap(model.title, position, basemap, this.state._csrf, err => {
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
            _this.onCreate()
          }
        })
      }
    }
  }

  onDelete = () => {
    const {t} = this
    const _this = this
    confirm({
      title: t('Confirm Deletion'),
      content: t('Please confirm deletion of ') + t(this.props.title),
      okText: t('Delete'),
      okType: 'danger',
      onOk () {
        Actions.deleteMap(_this.props.map_id, _this.state._csrf, (err) => {
          if (err) {
            notification.error({
              message: t('Error'),
              description: err.message || err.toString() || err,
              duration: 0
            })
          } else {
            window.location = '/maps'
          }
        })
      }
    })
  }

  toggleVisibility = (layerId: number) => {
    Actions.toggleVisibility(layerId, () => {})
  }

  showLayerDesigner = (layerId: number) => {
    const layer = _find(this.state.mapLayers, {layer_id: layerId})
    this.setState({showMapLayerDesigner: true, layerDesignerLayer: layer})
  }

  onLayerStyleChange = (layerId: number, style: Object, labels: Object, legend: Object) => {
    Actions.updateLayerStyle(layerId, style, labels, legend, (updatedLayer) => {
      this.setState({showMapLayerDesigner: true, layerDesignerLayer: updatedLayer})
    })
  }

  closeLayerDesigner = () => {
    this.setState({showMapLayerDesigner: false, layerDesignerLayer: undefined})
  }

  removeFromMap = (layer: Layer) => {
    Actions.removeFromMap(layer)
  }

  addLayer = (layer: Layer) => {
    const {t} = this
    const {mapState} = this.props.containers
    // clone the layer object so we don't mutate the data in the search results
    layer = JSON.parse(JSON.stringify(layer))
    if (mapState.state.map) {
      if (this.state.mapLayers && this.state.mapLayers.length === 0 && layer.extent_bbox) {
        mapState.state.map.fitBounds(layer.extent_bbox, 16, 25, false)
      }
      const position = mapState.state.map.getPosition()
      position.bounds = mapState.state.map.getBounds()
      Actions.setMapPosition(position)
    }
    if (_find(this.state.mapLayers, {layer_id: layer.layer_id})) {
      message.warning(t('Map already contains this layer'), 3)
    } else {
      Actions.addToMap(layer)
      // close add layer drawer
      this.setState({showAddLayer: false})
    }
  }

  editLayer = (layer: Layer) => {
    const {dataEditorState, mapState} = this.props.containers
    Actions.startEditing()
    dataEditorState.startEditing(layer)
    mapState.state.map.startEditingTool(layer)
    this.setState({activeTab: 'editing'})
  }

  stopEditingLayer = () => {
    const {mapState} = this.props.containers
    Actions.stopEditing()
    mapState.state.map.stopEditingTool()
    this.setState({activeTab: 'overlays'})
  }

  changeBaseMap = async (mapName: string) => {
    const {mapState, baseMapState} = this.props.containers
    const baseMapStyle = await baseMapState.setBaseMap(mapName)
    this.setState({allowLayersToMoveMap: false})
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
      mapLayers.forEach(mapLayer => {
        let foundInLayers
        layers.forEach(layer => {
          if (mapLayer.layer_id === layer.layer_id) {
            foundInLayers = true
          }
        })
        if (!foundInLayers) {
          updatedLayers.push(mapLayer)
        }
      })
      mapLayers = updatedLayers
    }
    Actions.setMapLayers(mapLayers, false)
  }

  render () {
    const {editLayer, toggleVisibility, removeFromMap, showLayerDesigner, t} = this
    const {showVisibility} = this.props
    const {showMapLayerDesigner, layerDesignerLayer, position, mapLayers, editingLayer, showAddLayer, activeTab} = this.state
    const {mapState} = this.props.containers

    if (!Array.isArray(mapLayers)) return 'bad maplayers array'

    let mapExtent
    if (position && position.bbox) {
      const bbox = position.bbox
      mapExtent = [bbox[0][0], bbox[0][1], bbox[1][0], bbox[1][1]]
    }

    return (
      <Row style={{width: '100%', height: '100%'}}>
        <Col sm={12} md={8} lg={6} style={{height: '100%'}}>
          {showMapLayerDesigner &&
            <Drawer
              title={t(layerDesignerLayer.name)}
              placement='left'
              width='350px'
              closable
              destroyOnClose
              bodyStyle={{ height: 'calc(100vh - 55px)', padding: '0px' }}
              onClose={this.closeLayerDesigner}
              visible
              mask={false}
            >
              <Row style={{height: 'calc(100% - 55px)', marginBottom: '10px'}}>
                <MapLayerDesigner
                  ref='LayerDesigner'
                  layer={layerDesignerLayer}
                  onStyleChange={this.onLayerStyleChange}
                  onClose={this.closeLayerDesigner}
                />
              </Row>
              <Row justify='center' align='middle' style={{textAlign: 'center'}}>
                <Button type='primary' onClick={this.closeLayerDesigner}>{t('Close')}</Button>
              </Row>
            </Drawer>}
          <style jsx global>{`
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
            style={{height: 'calc(100% - 50px)'}}
            tabBarStyle={{marginBottom: 0}}
            animated={false}
            activeKey={activeTab}
            onChange={(activeTab) => { this.setState({ activeTab }) }}
          >
            <TabPane tab={t('Base Map')} key='basemap' style={{height: '100%'}}>
              <BaseMapSelection onChange={this.changeBaseMap} t={t} />
            </TabPane>
            <TabPane tab={t('Layers')} key='overlays' style={{height: '100%'}}>
              <Row style={{height: 'calc(100% - 100px', width: '100%'}}>
                <LayerList
                  layers={mapLayers}
                  showVisibility={showVisibility}
                  showRemove showDesign showInfo showEdit={!editingLayer}
                  toggleVisibility={toggleVisibility}
                  removeFromMap={removeFromMap}
                  showLayerDesigner={showLayerDesigner}
                  updateLayers={Actions.setMapLayers}
                  editLayer={editLayer}
                  openAddLayer={() => { this.setState({showAddLayer: true}) }}
                  t={t}
                />
              </Row>
              <Row style={{height: '50px', textAlign: 'center', width: '100%'}}>
                <Button style={{margin: 'auto'}} type='primary' onClick={() => { this.setState({showAddLayer: true}) }}>{t('Add Layer')}</Button>
              </Row>
            </TabPane>
            {editingLayer &&
              <TabPane tab={t('Editing')} key='editing' style={{height: '100%'}}>
                <EditLayerPanel t={t} />
              </TabPane>}
          </Tabs>
          <hr style={{margin: 0}} />
          <Row justify='center' align='middle' style={{width: '100%', height: '50px'}}>
            <Col span={4}>
              <MapSettingsPanel />
            </Col>
            <Col span={16} style={{textAlign: 'right'}}>
              <Tooltip title={t('Delete Map')} placement='left'><Button danger onClick={this.onDelete} icon={<DeleteOutlined />} style={{marginRight: '10px'}} /></Tooltip>
              <SaveMapModal {...this.state} editing={this.props.edit} onSave={this.onSave} />
            </Col>
          </Row>
        </Col>
        <Col sm={12} md={16} lg={18} style={{height: '100%'}}>
          <Row style={{height: '100%', width: '100%', margin: 0, position: 'relative'}}>
            <Map
              id='create-map-map' style={{height: '100%', width: '100%', margin: 'auto'}}
              glStyle={this.state.mapStyle}
              insetMap
              insetConfig={this.state.settings ? this.state.settings.insetConfig : undefined}
              onChangeBaseMap={Actions.setMapBasemap}
              onToggleIsochroneLayer={this.onToggleIsochroneLayer}
              fitBounds={mapExtent}
              mapConfig={this.props.mapConfig}
              onLoad={this.initEditLayer}
              hash
              primaryColor={MAPHUBS_CONFIG.primaryColor}
              logoSmall={MAPHUBS_CONFIG.logoSmall}
              logoSmallHeight={MAPHUBS_CONFIG.logoSmallHeight}
              logoSmallWidth={MAPHUBS_CONFIG.logoSmallWidth}
              t={this.t}
              locale={this.state.locale}
              mapboxAccessToken={MAPHUBS_CONFIG.MAPBOX_ACCESS_TOKEN}
              DGWMSConnectID={MAPHUBS_CONFIG.DG_WMS_CONNECT_ID}
              earthEngineClientID={MAPHUBS_CONFIG.EARTHENGINE_CLIENTID}
            >
              {editingLayer &&
                <EditorToolButtons stopEditingLayer={this.stopEditingLayer} onFeatureUpdate={mapState.state.map.onFeatureUpdate} />}
            </Map>

            <MiniLegend
              t={t}
              style={{
                position: 'absolute',
                top: '5px',
                left: '5px',
                minWidth: '200px',
                width: '25%'
              }}
              layers={mapLayers}
              maxHeight='calc(100vh - 300px)'
              hideInactive showLayersButton={false}
            />
          </Row>
        </Col>
        <Drawer
          title={t('Add Layer')}
          placement='bottom'
          height='100vh'
          closable
          destroyOnClose
          bodyStyle={{ height: 'calc(100vh - 55px)', padding: '0px' }}
          onClose={() => { this.setState({showAddLayer: false}) }}
          visible={showAddLayer}
        >
          <AddLayerPanel
            myLayers={this.props.myLayers}
            popularLayers={this.props.popularLayers}
            groups={this.props.groups}
            onAdd={this.addLayer} t={t}
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
})
