// @flow
import React from 'react'

type Props = {|
  t: Function
|}

export default class AreaComparisonPanel extends React.Component<Props, void> {
  props: Props

  render () {
    const {t} = this.props
    return (
      <div>
        <b>{t('Select An Area')}</b>
        coming soon!
      </div>
    )
  }
}
