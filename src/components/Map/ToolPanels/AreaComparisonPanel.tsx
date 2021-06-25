import type { Element } from 'React'
import React from 'react'
type Props = {
  t: (...args: Array<any>) => any
}
export default class AreaComparisonPanel extends React.Component<Props, void> {
  props: Props

  render(): Element<'div'> {
    const { t } = this.props
    return (
      <div>
        <b>{t('Select An Area')}</b>
        coming soon!
      </div>
    )
  }
}