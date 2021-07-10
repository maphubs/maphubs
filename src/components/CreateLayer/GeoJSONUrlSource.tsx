import React, { useState } from 'react'
import Formsy, { addValidationRule } from 'formsy-react'
import { Row, message, notification, Button } from 'antd'
import LinkIcon from '@material-ui/icons/Link'
import TextInput from '../forms/textInput'
import LayerActions from '../../actions/LayerActions'
import Radio from '../forms/radio'
import useT from '../../hooks/useT'
import { useSelector } from 'react-redux'
import { LocaleState } from '../../redux/reducers/locale'

type Props = {
  onSubmit: (...args: Array<any>) => any
}
type State = {
  canSubmit: boolean
  selectedSource?: string
}

const GeoJSONUrlSource = ({
  onSubmit
}: {
  onSubmit: () => void
}): JSX.Element => {
  const [canSubmit, setCanSubmit] = useState(false)
  const { t } = useT()
  const _csrf = useSelector(
    (state: { locale: LocaleState }) => state.locale._csrf
  )
  addValidationRule('isHttps', (values, value) => {
    return value ? value.startsWith('https://') : false
  })

  const submit = (model: Record<string, any>): void => {
    LayerActions.saveDataSettings(
      {
        is_external: true,
        external_layer_type: 'GeoJSON',
        external_layer_config: {
          type: 'geojson',
          id: model.id,
          data_type: model.data_type,
          data: model.geojsonUrl
        }
      },
      _csrf,
      (err) => {
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

            onSubmit()
          })
        }
      }
    )
  }

  const dataTypeOptions = [
    {
      value: 'point',
      label: t('Point')
    },
    {
      value: 'line',
      label: t('Line')
    },
    {
      value: 'polygon',
      label: t('Polygon')
    }
  ]
  return (
    <Row
      style={{
        marginBottom: '20px'
      }}
    >
      <Formsy
        onValidSubmit={submit}
        onValid={() => {
          setCanSubmit(true)
        }}
        onInvalid={() => {
          setCanSubmit(false)
        }}
        style={{
          width: '100%'
        }}
      >
        <div>
          <p>{t('GeoJSON URL')}</p>
          <Row
            style={{
              marginBottom: '20px'
            }}
          >
            <TextInput
              name='geojsonUrl'
              label={t('GeoJSON URL')}
              icon={<LinkIcon />}
              validations='maxLength:500,isHttps'
              validationErrors={{
                maxLength: t('Must be 500 characters or less.'),
                isHttps: t(
                  'SSL required for external links, URLs must start with https://'
                )
              }}
              length={500}
              tooltipPosition='top'
              tooltip={
                t('Vector Tile URL for example:') +
                'http://myserver/tiles/{z}/{x}/{y}.pbf'
              }
              required
              t={t}
            />
          </Row>
          <Row
            style={{
              marginBottom: '20px'
            }}
          >
            <TextInput
              name='id'
              label={t('ID Property (Optional)')}
              tooltipPosition='top'
              tooltip={t(
                'Some features require idenify a unique identifier that can be used to select features'
              )}
              t={t}
            />
          </Row>
          <Row
            style={{
              marginBottom: '20px'
            }}
          >
            <Radio
              name='data_type'
              label=''
              defaultValue='point'
              options={dataTypeOptions}
            />
          </Row>
        </div>
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
    </Row>
  )
}
export default GeoJSONUrlSource
