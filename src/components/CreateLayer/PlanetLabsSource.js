// @flow
import React from 'react'
import Formsy from 'formsy-react'
import TextArea from '../forms/textArea'
import { message, notification, Row, Button } from 'antd'
import LayerActions from '../../actions/LayerActions'
import LayerStore from '../../stores/layer-store'
import MapHubsComponent from '../MapHubsComponent'
import type {LocaleStoreState} from '../../stores/LocaleStore'
import type {LayerStoreState} from '../../stores/layer-store'
import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig

type Props = {|
  onSubmit: Function
|}

type State = {
  canSubmit: boolean,
  selectedOption: string,
  selectedSceneOption: string
} & LocaleStoreState & LayerStoreState;

export default class PlanetLabsSource extends MapHubsComponent<Props, State> {
  props: Props

  state: State = {
    canSubmit: false,
    selectedOption: 'scene',
    selectedSceneOption: 'ortho'
  }

  constructor (props: Props) {
    super(props)
    this.stores.push(LayerStore)
  }

  enableButton = () => {
    this.setState({
      canSubmit: true
    })
  }

  disableButton = () => {
    this.setState({
      canSubmit: false
    })
  }

  getAPIUrl = (selected: string) => {
    const selectedArr = selected.split(':')
    const selectedType = selectedArr[0].trim()
    const selectedScene = selectedArr[1].trim()

    // build planet labs API URL
    // v1 https://tiles.planet.com/data/v1/PSScene3Band/20161221_024131_0e19/14/12915/8124.png?api_key=your-api-key
    const url = `https://tiles.planet.com/data/v1/${selectedType}/${selectedScene}/{z}/{x}/{y}.png?api_key=${MAPHUBS_CONFIG.PLANET_LABS_API_KEY}`
    return url
  }

  submit = (model: Object) => {
    const {t} = this
    const _this = this
    const layers = []

    const selectedIDs = model.selectedIDs

    const selectedIDArr = selectedIDs.split(',')

    selectedIDArr.forEach(selected => {
      const url = _this.getAPIUrl(selected)
      layers.push({
        planet_labs_scene: selected,
        tiles: [url]
      })
    })

    LayerActions.saveDataSettings({
      is_external: true,
      external_layer_type: 'Planet',
      external_layer_config: {
        type: 'multiraster',
        layers
      }

    }, _this.state._csrf, (err) => {
      if (err) {
        notification.error({
          message: t('Server Error'),
          description: err.message || err.toString() || err,
          duration: 0
        })
      } else {
        message.success(t('Layer Saved'), 1, () => {
          // reset style to load correct source
          LayerActions.resetStyle()
          // tell the map that the data is initialized
          LayerActions.tileServiceInitialized()
          _this.props.onSubmit()
        })
      }
    })
  }

  optionChange = (value: string) => {
    this.setState({selectedOption: value})
  }

  sceneOptionChange = (value: string) => {
    this.setState({selectedSceneOption: value})
  }

  render () {
    const {t} = this
    return (
      <Row style={{marginBottom: '20px'}}>
        <Formsy onValidSubmit={this.submit} onValid={this.enableButton} onInvalid={this.disableButton}>
          <div>
            <p>{t('Paste the selected IDs from the Planet Explorer API box')}</p>
            <Row style={{marginBottom: '20px'}}>
              <TextArea
                name='selectedIDs' label={t('Planet Explorer Selected IDs')}
                length={2000}
                icon='info' required
                t={t}
              />
            </Row>
          </div>
          <div style={{float: 'right'}}>
            <Button type='primary' htmlType='submit' disabled={!this.state.canSubmit}>{t('Save and Continue')}</Button>
          </div>
        </Formsy>
      </Row>
    )
  }
}
