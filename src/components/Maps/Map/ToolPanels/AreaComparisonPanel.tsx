import React from 'react'
import { LocalizedString } from '../../../types/LocalizedString'
type Props = {
  t: (v: string | LocalizedString) => string
}
const AreaComparisonPanel = ({ t }: Props): JSX.Element => {
  return (
    <div>
      <b>{t('Select An Area')}</b>
      coming soon!
    </div>
  )
}
export default AreaComparisonPanel
