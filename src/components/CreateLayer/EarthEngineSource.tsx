import React, { useState } from 'react'
import Formsy from 'formsy-react'
import { Row, message, notification, Button } from 'antd'
import TextInput from '../forms/textInput'
import useT from '../../hooks/useT'

import { useDispatch, useSelector } from '../../redux/hooks'
import LayerAPI from '../../redux/reducers/layer-api'
import {
  saveDataSettings,
  resetStyle,
  tileServiceInitialized
} from '../../redux/reducers/layerSlice'
import { Layer } from '../../types/layer'

const EarthEngineSource = ({
  onSubmit
}: {
  onSubmit: () => void
}): JSX.Element => {
  const [canSubmit, setCanSubmit] = useState(false)
  const { t } = useT()
  const dispatch = useDispatch()
  const layer_id = useSelector((state) => state.layer.layer_id)

  const submit = async (model: Record<string, any>): Promise<void> => {
    try {
      const dataSettings = {
        is_external: true,
        external_layer_type: 'Earth Engine',
        external_layer_config: {
          type: 'earthengine' as Layer['external_layer_config']['type'],
          min: Number.parseInt(model.min, 10),
          max: Number.parseInt(model.max, 10),
          image_id: model.image_id
        }
      }
      await LayerAPI.saveDataSettings(layer_id, dataSettings)
      message.success(t('Layer Saved'), 1, () => {
        // save in store
        dispatch(saveDataSettings(dataSettings))
        // reset style to load correct source
        dispatch(resetStyle())
        // tell the map that the data is initialized
        dispatch(tileServiceInitialized())

        onSubmit()
      })
    } catch (err) {
      notification.error({
        message: t('Server Error'),
        description: err.message || err.toString() || err,
        duration: 0
      })
    }
  }

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
      >
        <div>
          <p>{t('Earth Engine Source')}</p>
          <Row
            style={{
              marginBottom: '20px'
            }}
          >
            <TextInput
              name='image_id'
              label={t('Image ID/Asset ID')}
              icon='info'
              validations='maxLength:200'
              validationErrors={{
                maxLength: t('Must be 200 characters or less.')
              }}
              length={200}
              tooltipPosition='top'
              tooltip={t('EarthEngine Image ID or Asset ID')}
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
              name='min'
              label={t('Min (Optional)')}
              icon='info'
              t={t}
            />
          </Row>
          <Row
            style={{
              marginBottom: '20px'
            }}
          >
            <TextInput
              name='max'
              label={t('Max (Optional)')}
              icon='info'
              t={t}
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
export default EarthEngineSource
