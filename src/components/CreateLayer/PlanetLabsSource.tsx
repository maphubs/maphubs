import React, { useState } from 'react'
import Formsy from 'formsy-react'
import TextArea from '../forms/textArea'
import { message, notification, Row, Button } from 'antd'
import LayerActions from '../../actions/LayerActions'
import useT from '../../hooks/useT'
import { useSelector } from 'react-redux'
import { LocaleState } from '../../redux/reducers/locale'
import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig

const getAPIUrl = (selected: string): string => {
  const selectedArr = selected.split(':')
  const selectedType = selectedArr[0].trim()
  const selectedScene = selectedArr[1].trim()
  // build planet labs API URL
  // v1 https://tiles.planet.com/data/v1/PSScene3Band/20161221_024131_0e19/14/12915/8124.png?api_key=your-api-key
  const url = `https://tiles.planet.com/data/v1/${selectedType}/${selectedScene}/{z}/{x}/{y}.png?api_key=${MAPHUBS_CONFIG.PLANET_LABS_API_KEY}`
  return url
}

const PlanetLabsSource = ({
  onSubmit
}: {
  onSubmit: () => void
}): JSX.Element => {
  const { t } = useT()
  const _csrf = useSelector(
    (state: { locale: LocaleState }) => state.locale._csrf
  )
  const [canSubmit, setCanSubmit] = useState(false)

  const submit = (model: Record<string, any>): void => {
    const layers = []
    const selectedIDs = model.selectedIDs
    const selectedIDArr = selectedIDs.split(',')
    for (const selected of selectedIDArr) {
      const url = getAPIUrl(selected)

      layers.push({
        planet_labs_scene: selected,
        tiles: [url]
      })
    }
    LayerActions.saveDataSettings(
      {
        is_external: true,
        external_layer_type: 'Planet',
        external_layer_config: {
          type: 'multiraster',
          layers
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
          <p>{t('Paste the selected IDs from the Planet Explorer API box')}</p>
          <Row
            style={{
              marginBottom: '20px'
            }}
          >
            <TextArea
              name='selectedIDs'
              label={t('Planet Explorer Selected IDs')}
              length={2000}
              icon='info'
              required
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
export default PlanetLabsSource
