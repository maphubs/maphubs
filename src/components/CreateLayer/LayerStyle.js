// @flow
import React from 'react'
import MapStyles from '../Map/Styles'
import Map from '../Map'
import MiniLegend from '../Map/MiniLegend'
import LayerStore from '../../stores/layer-store'
import LayerActions from '../../actions/LayerActions'
import MessageActions from '../../actions/MessageActions'
import ConfirmationActions from '../../actions/ConfirmationActions'
import Progress from '../Progress'
import OpacityChooser from '../LayerDesigner/OpacityChooser'
import LayerDesigner from '../LayerDesigner/LayerDesigner'
import MapHubsComponent from '../MapHubsComponent'
import { Subscribe } from 'unstated'
import MapContainer from '../Map/containers/MapContainer'
import type {LayerStoreState} from '../../stores/layer-store'
import type {LocaleStoreState} from '../../stores/LocaleStore'
import type {GLStyle} from '../../types/mapbox-gl-style'

type Props = {|
  onSubmit: Function,
  showPrev?: boolean,
  prevText?: string,
  onPrev?: Function,
  mapConfig: Object,
  waitForTileInit: boolean
|}

type State = {
  rasterOpacity: number,
  saving: boolean
} & LayerStoreState & LocaleStoreState

export default class LayerStyle extends MapHubsComponent<Props, State> {
  static defaultProps = {
    waitForTileInit: false // wait for tile service before showing map
  }

  constructor (props: Props) {
    super(props)
    this.stores.push(LayerStore)
    this.state = {
      rasterOpacity: 100,
      saving: false
    }
  }

  onSubmit = (MapState: Object) => {
    const _this = this
    const {t} = this
    _this.setState({saving: true})
    const preview_position = MapState.state.map.getPosition()
    preview_position.bbox = MapState.state.map.getBounds()
    LayerActions.saveStyle({
      layer_id: this.state.layer_id,
      style: this.state.style,
      labels: this.state.labels,
      legend_html: this.state.legend_html,
      preview_position
    },
    this.state._csrf,
    (err) => {
      _this.setState({saving: false})
      if (err) {
        MessageActions.showMessage({title: t('Error'), message: err})
      } else {
        _this.props.onSubmit(_this.state.layer_id, _this.state.name)
      }
    })
  }

  onPrev = () => {
    if (this.props.onPrev) this.props.onPrev()
  }

  setRasterOpacity = (opacity: number) => {
    const elc = this.state.external_layer_config ? this.state.external_layer_config : {}
    const layer_id = this.state.layer_id ? this.state.layer_id : 0
    let style = null
    if (this.state.is_external && elc.type === 'ags-mapserver-tiles' && elc.url) {
      style = MapStyles.raster.rasterStyleTileJSON(layer_id, this.state.shortid, elc.url + '?f=json', opacity, 'arcgisraster')
    } else if (this.state.is_external && elc.type === 'multiraster' && elc.layers) {
      style = MapStyles.raster.multiRasterStyleWithOpacity(layer_id, this.state.shortid, elc.layers, opacity, 'raster')
    } else {
      style = MapStyles.raster.rasterStyleWithOpacity(layer_id, this.state.shortid, elc, opacity)
    }

    const legend_html = MapStyles.legend.rasterLegend(this.state)
    LayerActions.setStyle({style, legend_html})
    this.setState({rasterOpacity: opacity})
  }

  onColorChange = (style: GLStyle, legend_html: string) => {
    LayerActions.setStyle({style, legend_html})
  }

  setStyle = (style: GLStyle) => {
    LayerActions.setStyle({style})
  }

  setLabels = (style: GLStyle, labels: Object) => {
    LayerActions.setStyle({style, labels})
  }

  setLegend = (legend_html: string) => {
    LayerActions.setStyle({legend_html})
  }

  reloadMap = (MapState: Object) => {
    MapState.state.map.reloadStyle()
  }

  resetStyle = () => {
    const {t} = this
    ConfirmationActions.showConfirmation({
      title: t('Confirm Reset'),
      postitiveButtonText: t('Reset'),
      negativeButtonText: t('Cancel'),
      message: t('Warning! This will permanently delete all custom style settings from this layer.'),
      onPositiveResponse () {
        LayerActions.resetStyle()
      }
    })
  }

  render () {
    const {reloadMap, t} = this
    const showMap = this.props.waitForTileInit ? this.state.tileServiceInitialized : true
    const {layer_id, style, preview_position} = this.state
    const {showPrev} = this.props
    let mapExtent
    if (preview_position && preview_position.bbox) {
      const bbox = preview_position.bbox
      mapExtent = [bbox[0][0], bbox[0][1], bbox[1][0], bbox[1][1]]
    }

    const externalLayerConfig: Object = this.state.external_layer_config ? this.state.external_layer_config : {}
    const legendCode: string = this.state.legend_html ? this.state.legend_html : ''
    const cssStyle: Object = this.state.style ? this.state.style : {}

    let colorChooserMode = 'default'
    if (this.state.is_external &&
      (externalLayerConfig.type === 'raster' ||
      externalLayerConfig.type === 'multiraster' ||
      externalLayerConfig.type === 'ags-mapserver-tiles')) {
      colorChooserMode = 'external'
    } else if (this.state.is_external && externalLayerConfig.type === 'mapbox-style') {
      colorChooserMode = 'mapbox'
    }

    return (
      <div>
        <Progress id='save-style-progess' title={t('Saving')} subTitle='' dismissible={false} show={this.state.saving} />
        <div className='row'>
          <div className='row center'>
            <div className='col s12 m6 l6'>
              <h5>{t('Choose Preview')}</h5>
              {(layer_id !== undefined && layer_id !== -1 && showMap) &&
                <div>
                  <div className='row no-margin'>
                    <Map id='layer-style-map' className='z-depth-2' insetMap={false} style={{height: '300px', width: '400px', margin: 'auto'}}
                      glStyle={style}
                      showLogo
                      mapConfig={this.props.mapConfig}
                      fitBounds={mapExtent}
                      primaryColor={MAPHUBS_CONFIG.primaryColor}
                      logoSmall={MAPHUBS_CONFIG.logoSmall}
                      logoSmallHeight={MAPHUBS_CONFIG.logoSmallHeight}
                      logoSmallWidth={MAPHUBS_CONFIG.logoSmallWidth}
                      t={t}
                      locale={this.state.locale}
                      mapboxAccessToken={MAPHUBS_CONFIG.MAPBOX_ACCESS_TOKEN}
                    />
                  </div>
                  <div className='row' style={{width: '400px', position: 'relative', margin: 'auto'}}>
                    <MiniLegend t={t} style={{position: 'absolute', height: 'auto', width: '400px', margin: 'auto'}}
                      collapsible={false} hideInactive={false} showLayersButton={false}
                      layers={[this.state]} />
                  </div>
                </div>
              }
            </div>
            <Subscribe to={[MapContainer]}>
              {MapState => (
                <div className='col s12 m6 l6' style={{width: '425px'}}>
                  {colorChooserMode === 'default' &&
                    <div>
                      <h5>{t('Choose Style')}</h5>
                      <LayerDesigner onColorChange={this.onColorChange}
                        style={cssStyle} onStyleChange={this.setStyle}
                        labels={this.state.labels} onLabelsChange={this.setLabels} onMarkersChange={this.setStyle}
                        layer={this.state}
                        legend={legendCode} onLegendChange={this.setLegend} />
                    </div>
                  }
                  {colorChooserMode === 'external' &&
                    <div>
                      <h5>{t('Choose Style')}</h5>
                      <OpacityChooser value={this.state.rasterOpacity} onChange={this.setRasterOpacity}
                        style={cssStyle} onStyleChange={this.setStyle} onColorChange={this.onColorChange}
                        layer={this.state}
                        legendCode={legendCode} onLegendChange={this.setLegend} showAdvanced />
                    </div>
                  }
                  {colorChooserMode === 'mapbox' &&
                    <div style={{marginTop: '20px', marginBottom: '20px', padding: '20px', border: '1px solid #b1b1b1'}}>
                      <b>{t('Mapbox Studio Style Layer')}</b>
                      <p>{t('If you are the owner of this layer, click here to edit in Mapbox Studio on mapbox.com')}</p>
                      <a target='_blank' rel='noopener noreferrer' className='btn' href={'https://www.mapbox.com/studio/styles/' + externalLayerConfig.mapboxid + '/edit'}>{t('Edit in Mapbox Studio')}</a>
                      <p>{t('Once you have published your style on Mapbox,click refresh the preview map.')}
                        <b>{t('It may take a few minutes for the changes to appear, your layer will update automatically.')}</b>
                      </p>
                      <button onClick={() => { reloadMap(MapState) }} className='waves-effect waves-light btn'>{t('Reload')}</button>
                    </div>
                  }
                  <div className='right'>
                    <button onClick={this.resetStyle} style={{marginRight: '10px'}} className='waves-effect waves-light btn'>{t('Reset')}</button>
                    <button onClick={() => { this.onSubmit(MapState) }} className='waves-effect waves-light btn'>{t('Save')}</button>
                  </div>
                </div>
              )}
            </Subscribe>
          </div>
          {showPrev &&
            <div className='left'>
              <a className='waves-effect waves-light btn' onClick={this.onPrev}><i className='material-icons left'>arrow_back</i>{this.props.prevText}</a>
            </div>
          }
        </div>
      </div>
    )
  }
}
