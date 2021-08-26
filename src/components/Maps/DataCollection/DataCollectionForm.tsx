import React, { useState } from 'react'
import { Button } from 'antd'
import Formsy from 'formsy-react'
import FormField from './FormField'
import { LocalizedString } from '../../../types/LocalizedString'

type Props = {
  presets: Array<Record<string, any>>
  values?: Record<string, any>
  showSubmit?: boolean
  onSubmit?: (model: Record<string, unknown>) => void
  onChange?: (model: Record<string, unknown>) => void
  style?: React.CSSProperties
  t: (v: string | LocalizedString) => string //* used by both Maps MapHubs UI so needs to be passed t()
}

const DataCollectionForm = ({
  style,
  showSubmit,
  presets,
  values,
  onSubmit,
  onChange,
  t
}: Props): JSX.Element => {
  const [canSubmit, setCanSubmit] = useState(false)

  return (
    <div style={style}>
      <Formsy
        onValidSubmit={(model: Record<string, unknown>) => {
          if (onSubmit) onSubmit(model)
        }}
        onChange={(model: Record<string, unknown>) => {
          if (onChange) onChange(model)
        }}
        onValid={() => {
          setCanSubmit(true)
        }}
        onInvalid={() => {
          setCanSubmit(false)
        }}
      >
        {presets.map((preset) => {
          let value

          if (values && values[preset.tag]) {
            value = values[preset.tag]
          }

          if (preset.tag !== 'photo_url') {
            return (
              <FormField t={t} key={preset.tag} preset={preset} value={value} />
            )
          }
        })}
        {showSubmit && (
          <div
            style={{
              float: 'right'
            }}
          >
            <Button type='primary' htmlType='submit' disabled={!canSubmit}>
              {t('Submit')}
            </Button>
          </div>
        )}
      </Formsy>
    </div>
  )
}
DataCollectionForm.defaultProps = {
  showSubmit: true
}
export default DataCollectionForm
