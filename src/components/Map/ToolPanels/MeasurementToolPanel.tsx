import React from 'react'
import { Switch, Button } from 'antd'
import { LocalizedString } from '../../../types/LocalizedString'
type Props = {
  enableMeasurementTools: boolean
  closePanel: () => void
  toggleMeasurementTools: (enabled: boolean) => void
  measureFeatureClick: () => void
  t: (v: string | LocalizedString) => string
}

const MeasurementToolPanel = ({
  t,
  enableMeasurementTools,
  closePanel,
  toggleMeasurementTools,
  measureFeatureClick
}: Props): JSX.Element => {
  return (
    <div
      style={{
        textAlign: 'center'
      }}
    >
      <b>{t('Show Measurement Tools')}</b>
      <div>
        <Switch
          checked={enableMeasurementTools}
          onChange={(enableMeasurementTools: boolean) => {
            if (enableMeasurementTools) closePanel()
            toggleMeasurementTools(enableMeasurementTools)
          }}
        />
      </div>
      <div
        style={{
          marginTop: '20px'
        }}
      >
        <Button type='primary' onClick={measureFeatureClick}>
          {t('Select a Feature')}
        </Button>
      </div>
    </div>
  )
}
export default MeasurementToolPanel
