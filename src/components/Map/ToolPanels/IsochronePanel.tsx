import React, { useState } from 'react'
import { Button } from 'antd'
import { LocalizedString } from '../../../types/LocalizedString'
type Props = {
  getIsochronePoint: () => void
  clearIsochroneLayers: () => void
  isochroneResult?: Record<string, any>
  t: (v: string | LocalizedString) => string
}

const IsochronePanel = ({
  t,
  isochroneResult,
  getIsochronePoint,
  clearIsochroneLayers
}: Props): JSX.Element => {
  const [selectingLocation, setSelectingLocation] = useState(false)

  return (
    <div
      style={{
        width: '100%',
        textAlign: 'center'
      }}
    >
      {!isochroneResult && (
        <>
          <Button
            type='primary'
            onClick={() => {
              setSelectingLocation(true)
              getIsochronePoint()
            }}
          >
            {t('Select Location')}
          </Button>
          {selectingLocation && <p>{t('Click a location on the map.')}</p>}
        </>
      )}
      {isochroneResult && <p>{t('Displaying Result')}</p>}
      {(isochroneResult || selectingLocation) && (
        <Button
          type='primary'
          onClick={() => {
            setSelectingLocation(false)
            clearIsochroneLayers()
          }}
        >
          {t('Reset')}
        </Button>
      )}
    </div>
  )
}
export default IsochronePanel
