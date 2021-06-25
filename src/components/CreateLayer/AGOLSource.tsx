import React from 'react'
import Formsy, { addValidationRule } from 'formsy-react'
import { Row, Col, message, notification, Button } from 'antd'
import LinkIcon from '@material-ui/icons/Link'
import TextInput from '../forms/textInput'
import Radio from '../forms/radio'
import LayerActions from '../../actions/LayerActions'
import LayerStore from '../../stores/layer-store'

import type { LocaleStoreState } from '../../stores/LocaleStore'
import type { LayerStoreState } from '../../stores/layer-store'
type Props = {
  onSubmit: () => void
}
type State = {
  canSubmit: boolean
  selectedOption: string
} & LocaleStoreState &
  LayerStoreState
export default class AGOLSource extends React.Component<Props, State> {
  state: State = {
    canSubmit: false,
    selectedOption: 'mapserverquery'
  }

  constructor(props: Props) {
    super(props)
    this.stores.push(LayerStore)
    addValidationRule('isHttps', (values, value: string) => {
      return value ? value.startsWith('https://') : false
    })
  }

  enableButton = (): void => {
    this.setState({
      canSubmit: true
    })
  }
  disableButton = (): void => {
    this.setState({
      canSubmit: false
    })
  }
  submit = (model: Record<string, any>): void => {
    const { t } = this

    const _this = this

    let dataSettings

    if (model.mapServiceUrl) {
      dataSettings = {
        is_external: true,
        external_layer_type: 'ArcGIS MapServer Query',
        external_layer_config: {
          type: 'ags-mapserver-query',
          url: model.mapServiceUrl
        }
      }
    } else if (model.featureServiceUrl) {
      dataSettings = {
        is_external: true,
        external_layer_type: 'ArcGIS FeatureServer Query',
        external_layer_config: {
          type: 'ags-featureserver-query',
          url: model.featureServiceUrl
        }
      }
    }

    LayerActions.saveDataSettings(dataSettings, _this.state._csrf, (err) => {
      if (err) {
        notification.error({
          message: t('Server Error'),
          description: err.message || err.toString(),
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
  optionChange = (value: string): void => {
    this.setState({
      selectedOption: value
    })
  }

  render(): JSX.Element {
    const { t, state, optionChange, submit, enableButton, disableButton } = this
    const { selectedOption, canSubmit } = state
    const agolOptions = [
      {
        value: 'mapserverquery',
        label: t('Link to a MapServer Query Service')
      },
      {
        value: 'featureserverquery',
        label: t('Link to a FeatureServer Query Service')
      }
    ]
    let msqOption = false
    let fsqOption = false

    switch (selectedOption) {
      case 'mapserverquery':
        msqOption = true
        break

      case 'featureserverquery':
        fsqOption = true
        break

      default:
        break
    }

    let msqForm = <></>

    if (msqOption) {
      msqForm = (
        <div>
          <p>{t('ArcGIS MapServer Query Source')}</p>
          <Row
            style={{
              marginBottom: '20px'
            }}
          >
            <TextInput
              name='mapServiceUrl'
              label={t('Map Service URL')}
              icon={<LinkIcon />}
              validations='maxLength:250,isHttps'
              validationErrors={{
                maxLength: t('Must be 250 characters or less.'),
                isHttps: t(
                  'SSL required for external links, URLs must start with https://'
                )
              }}
              length={250}
              tooltipPosition='top'
              tooltip={t(
                'Map Service URL: ex: http://myserver/arcgis/rest/services/MyMap/MapServer/0'
              )}
              required
              t={t}
            />
          </Row>
        </div>
      )
    }

    let fsqForm = <></>

    if (fsqOption) {
      fsqForm = (
        <div>
          <p>{t('ArcGIS FeatureService Query Source')}</p>
          <Row
            style={{
              marginBottom: '20px'
            }}
          >
            <TextInput
              name='featureServiceUrl'
              label={t('Feature Service URL')}
              icon={<LinkIcon />}
              validations='maxLength:250,isHttps'
              validationErrors={{
                maxLength: t('Must be 250 characters or less.'),
                isHttps: t(
                  'SSL required for external links, URLs must start with https://'
                )
              }}
              length={250}
              tooltipPosition='top'
              tooltip={t(
                'Feature Service URL ex: http://myserver/arcgis/rest/services/MyMap/FeatureServer/0'
              )}
              required
              t={t}
            />
          </Row>
        </div>
      )
    }

    return (
      <Row
        style={{
          marginBottom: '20px'
        }}
      >
        <Col span={12}>
          <Formsy>
            <b>{t('Choose an Option')}</b>
            <Row
              style={{
                marginBottom: '20px'
              }}
            >
              <Radio
                name='type'
                label=''
                defaultValue={selectedOption}
                options={agolOptions}
                onChange={optionChange}
              />
            </Row>
          </Formsy>
        </Col>
        <Col span={12}>
          <Formsy
            onValidSubmit={submit}
            onValid={enableButton}
            onInvalid={disableButton}
          >
            {msqForm}
            {fsqForm}
            <div
              style={{
                float: 'right'
              }}
            >
              <Button type='primary' htmlType='submit' disabled={!canSubmit}>
                {t('Save and Continue')}
              </Button>
            </div>
          </Formsy>
        </Col>
      </Row>
    )
  }
}
