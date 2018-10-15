// @flow
import React from 'react'
import LayerList from './LayerList'
import _isEqual from 'lodash.isequal'
import _debounce from 'lodash.debounce'
import _find from 'lodash.find'
import Map from '../Map'
import MiniLegend from '../Map/MiniLegend'
import AddLayerPanel from './AddLayerPanel'
import SaveMapPanel from './SaveMapPanel'
import MapSettingsPanel from './MapSettingsPanel'
import MapMakerStore from '../../stores/MapMakerStore'
import UserStore from '../../stores/UserStore'
import Actions from '../../actions/MapMakerActions'
import ConfirmationActions from '../../actions/ConfirmationActions'
import NotificationActions from '../../actions/NotificationActions'
import MessageActions from '../../actions/MessageActions'
import EditLayerPanel from './EditLayerPanel'
import MapLayerDesigner from '../LayerDesigner/MapLayerDesigner'
import EditorToolButtons from './EditorToolButtons'
import IsochroneLegendHelper from '../Map/IsochroneLegendHelper'
import MapHubsComponent from '../MapHubsComponent'
import Reflux from '../Rehydrate'
import fireResizeEvent from '../../services/fire-resize-event'
import type {LocaleStoreState} from '../../stores/LocaleStore'
import type {UserStoreState} from '../../stores/UserStore'
import type {MapMakerStoreState} from '../../stores/MapMakerStore'
import type {Layer} from '../../types/layer'
import connect from 'unstated-connect'
import DataEditorContainer from '../Map/containers/DataEditorContainer'
import MapContainer from '../Map/containers/MapContainer'
import BaseMapContainer from '../Map/containers/BaseMapContainer'

import $ from 'jquery'

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
    containers: Array<Object>
  }

  type State = {
    showMapLayerDesigner: boolean,
    layerDesignerLayer?: Layer,
    canSave: boolean,
    editLayerLoaded: boolean,
    saved: boolean,
    height: number,
    width: number
  } & LocaleStoreState & MapMakerStoreState & UserStoreState

class MapMaker extends MapHubsComponent<Props, State> {
  props: Props

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
    width: 800,
    height: 600
  }

  constructor (props: Props) {
    super(props)
    this.stores.push(MapMakerStore)
    this.stores.push(UserStore)
    Reflux.rehydrate(MapMakerStore, {
      position: this.props.position,
      title: this.props.title,
      map_id: this.props.map_id,
      owned_by_group_id: this.props.owned_by_group_id
    })
  }

  componentWillMount () {
    super.componentWillMount()
    const {mapLayers, basemap, settings} = this.props
    if (mapLayers) { Actions.setMapLayers(mapLayers) }
    if (basemap) { Actions.setMapBasemap(basemap) }
    if (settings) { Actions.setSettings(settings) }
  }

  componentDidMount () {
    const _this = this
    const {t} = this
    this.tabsInstance = M.Tabs.init(this.refs.tabs, {})
    M.Collapsible.init(this.refs.mapMakerToolPanel, {})
    if (this.props.edit) {
      _this.toggleMapTab()
    }

    function getSize () {
      // Get the dimensions of the viewport
      const width = Math.floor($(window).width())
      const height = $(window).height()
      return {width, height}
    }

    const size = getSize()
    _this.setState({
      width: size.width,
      height: size.height
    })

    $(window).resize(function () {
      const debounced = _debounce(() => {
        const size = getSize()
        _this.setState({
          width: size.width,
          height: size.height
        })
      }, 2500).bind(this)
      debounced()
    })

    window.addEventListener('beforeunload', (e) => {
      const {saved, mapLayers} = _this.state
      if (!saved && mapLayers && mapLayers.length > 0) {
        const msg = t('Please save your map to avoid losing your work!')
        e.returnValue = msg
        return msg
      }
    })
  }

  componentWillReceiveProps (nextProps: Props) {
    if (!_isEqual(nextProps.position, this.props.position)) {
      Actions.setMapPosition(nextProps.position)
    }
  }

  componentDidUpdate (prevProps: Props, prevState: State) {
    const {editLayerPanel, layersListPanel, saveMapPanel} = this.refs
    if (this.state.editingLayer && !prevState.editingLayer) {
      // starting editing
      if (editLayerPanel) {
        $(layersListPanel).removeClass('active')
        $(layersListPanel).find('.collapsible-body').css('display', 'none')

        $(saveMapPanel).removeClass('active')
        $(saveMapPanel).find('.collapsible-body').css('display', 'none')

        $(editLayerPanel).addClass('active')
        $(editLayerPanel).find('.collapsible-body').css('display', 'block')
      }
    } else if (!this.state.editingLayer && prevState.editingLayer) {
      // stopping editing
      $(layersListPanel).addClass('active')
      $(layersListPanel).find('.collapsible-body').css('display', 'block')
    }

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
    ConfirmationActions.showConfirmation({
      title: t('Confirm Cancel'),
      postitiveButtonText: t('Cancel Map'),
      negativeButtonText: t('Return to Editing Map'),
      message: t('Your map has not been saved, please confirm that you want to cancel your map.'),
      onPositiveResponse () {
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
    const _this = this
    const [, MapState, BaseMapState] = this.props.containers
    const position = MapState.state.map.getPosition()
    position.bbox = MapState.state.map.getBounds()

    if (model.private === undefined) model.private = false

    const err = this.privacyCheck(model.private, model.group)
    if (err) {
      MessageActions.showMessage({title: _this.__('Error'), message: err})
    } else {
      const basemap = BaseMapState.state.baseMap
      if (!this.state.map_id || this.state.map_id === -1) {
        Actions.createMap(model.title, position, basemap, model.group, model.private, _this.state._csrf, err => {
          cb()
          if (err) {
            // display error to user
            MessageActions.showMessage({title: _this.__('Error'), message: err})
          } else {
            // hide designer
            NotificationActions.showNotification({message: _this.__('Map Saved')})
            _this.onCreate()
          }
        })
      } else {
        Actions.saveMap(model.title, position, basemap, this.state._csrf, err => {
          cb()
          if (err) {
            // display error to user
            MessageActions.showMessage({title: _this.__('Error'), message: err})
          } else {
            // hide designer
            NotificationActions.showNotification({message: _this.__('Map Saved')})
            _this.onCreate()
          }
        })
      }
    }
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
    const _this = this
    const [, MapState] = this.props.containers
    // clone the layer object so we don't mutate the data in the search results
    layer = JSON.parse(JSON.stringify(layer))

    if (this.state.mapLayers && this.state.mapLayers.length === 0 && layer.extent_bbox) {
      MapState.state.map.fitBounds(layer.extent_bbox, 16, 25, false)
    }

    const position = MapState.state.map.getPosition()
    position.bounds = MapState.state.map.getBounds()

    Actions.setMapPosition(position)
    Actions.addToMap(layer, (err) => {
      if (err) {
        NotificationActions.showNotification({message: _this.__('Map already contains this layer'), dismissAfter: 3000, position: 'topright'})
      }

      // switch to map tab
      _this.toggleMapTab()
    })
  }

  toggleMapTab = () => {
    this.tabsInstance.select('maptab')
    fireResizeEvent()
  }

  toggleAddLayerTab = () => {
    this.tabsInstance.select('addlayer')
    // fireResizeEvent()
  }

  editLayer = (layer: Layer) => {
    const [DataEditor, MapState] = this.props.containers
    Actions.startEditing()
    DataEditor.startEditing(layer)
    MapState.state.map.startEditingTool(layer)
  }

  stopEditingLayer = () => {
    const [, MapState] = this.props.containers
    Actions.stopEditing()
    MapState.state.map.stopEditingTool()
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
    const {showMapLayerDesigner, height, layerDesignerLayer, position, mapLayers, editingLayer} = this.state
    const [, MapState] = this.props.containers
    const headerHeight = 52
    const collasibleHeaderHeight = 56
    let panelHeight = height - headerHeight - (collasibleHeaderHeight * 3)

    let tabContentDisplay = 'none'
    if (typeof window !== 'undefined') {
      tabContentDisplay = 'inherit'
    }

    let mapLayerDesigner = ''
    if (showMapLayerDesigner) {
      mapLayerDesigner = (
        <MapLayerDesigner ref='LayerDesigner'
          layer={layerDesignerLayer}
          onStyleChange={this.onLayerStyleChange}
          onClose={this.closeLayerDesigner} />
      )
    }

    let editLayerPanel = ''
    if (editingLayer) {
    // panelHeight = this.state.height - 241;
      panelHeight = this.state.height - headerHeight - (collasibleHeaderHeight * 4)
      editLayerPanel = (
        <li ref='editLayerPanel'>
          <div className='collapsible-header'><i className='material-icons'>edit</i>{t('Editing Layer')}</div>
          <div className='collapsible-body' >
            <div style={{height: panelHeight.toString() + 'px', overflow: 'auto'}}>
              <EditLayerPanel t={t} />
            </div>
          </div>
        </li>
      )
    }

    let mapExtent
    if (position && position.bbox) {
      const bbox = position.bbox
      mapExtent = [bbox[0][0], bbox[0][1], bbox[1][0], bbox[1][1]]
    }

    return (
      <div className='row no-margin' style={{width: '100%', height: '100%'}}>
        <div className='create-map-side-nav col s6 m4 l3 no-padding' style={{height: '100%'}}>
          {mapLayerDesigner}
          <ul ref='mapMakerToolPanel' className='collapsible no-margin' data-collapsible='accordion'
            style={{
              height: '100%',
              borderTop: 'none',
              display: showMapLayerDesigner ? 'none' : 'inherit'
            }}
          >
            {editLayerPanel}
            <li ref='layersListPanel' className='active'>
              <div className='collapsible-header'><i className='material-icons'>layers</i>{t('Overlay Layers')}</div>
              <div className='collapsible-body' >
                <div style={{height: panelHeight.toString() + 'px', overflow: 'auto'}}>
                  <LayerList
                    layers={mapLayers}
                    showVisibility={showVisibility}
                    showRemove showDesign showEdit={!editingLayer}
                    toggleVisibility={toggleVisibility}
                    removeFromMap={removeFromMap}
                    showLayerDesigner={showLayerDesigner}
                    updateLayers={Actions.setMapLayers}
                    editLayer={editLayer}
                  />
                </div>

              </div>
            </li>
            <li ref='saveMapPanel'>
              <div className='collapsible-header'><i className='material-icons'>save</i>{t('Save Map')}</div>
              <div className='collapsible-body'>
                <div style={{height: panelHeight.toString() + 'px', overflow: 'auto'}}>
                  <SaveMapPanel {...this.state} editing={this.props.edit} onSave={this.onSave} />
                </div>

              </div>
            </li>
            <li ref='settingsPanel'>
              <div className='collapsible-header'><i className='material-icons'>settings</i>{t('Map Settings')}</div>
              <div className='collapsible-body'>
                <div style={{height: panelHeight.toString() + 'px', overflow: 'auto'}}>
                  <MapSettingsPanel />
                </div>

              </div>
            </li>
          </ul>
        </div>
        <div className='col s6 m8 l9 no-padding' style={{height: '100%'}}>
          <ul className='tabs' ref='tabs' style={{overflowX: 'hidden', borderBottom: '1px solid #ddd'}}>
            <li className='tab mapmaker-tab'><a className='active' href='#addlayer' onClick={this.toggleAddLayerTab}>{t('Add a Layer')}</a></li>
            <li className='tab mapmaker-tab'><a href='#maptab' onClick={this.toggleMapTab}>{t('View Map')}</a></li>
          </ul>

          <div id='addlayer' style={{height: 'calc(100vh - 100px)', overflow: 'scroll'}}>
            <AddLayerPanel myLayers={this.props.myLayers}
              popularLayers={this.props.popularLayers}
              groups={this.props.groups}
              onAdd={this.addLayer} />
          </div>
          <div id='maptab' className='row no-margin' style={{height: 'calc(100vh - 100px)', display: tabContentDisplay}}>
            <div className='row' style={{height: '100%', width: '100%', margin: 0, position: 'relative'}}>
              <Map id='create-map-map' style={{height: '100%', width: '100%', margin: 'auto'}}
                glStyle={this.state.mapStyle}
                baseMap={this.state.basemap}
                insetMap
                insetConfig={this.state.settings ? this.state.settings.insetConfig : undefined}
                onChangeBaseMap={Actions.setMapBasemap}
                onToggleIsochroneLayer={this.onToggleIsochroneLayer}
                fitBounds={mapExtent}
                mapConfig={this.props.mapConfig}
                hash
                t={this.t}
              >
                {editingLayer &&
                  <EditorToolButtons stopEditingLayer={this.stopEditingLayer} onFeatureUpdate={MapState.state.map.onFeatureUpdate} />
                }
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
                collapseToBottom={false} hideInactive showLayersButton={false} />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default connect([DataEditorContainer, MapContainer, BaseMapContainer])(MapMaker)
