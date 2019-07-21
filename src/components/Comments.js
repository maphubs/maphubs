// @flow
import React from 'react'
import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig

type Props = {

}

export default class Comments extends React.PureComponent<Props, void> {
  componentDidMount () {
    // eslint-disable-next-line no-undef
    if (Coral && Coral.Talk) {
      // eslint-disable-next-line no-undef
      Coral.Talk.render(document.getElementById(MAPHUBS_CONFIG.CORAL_TALK_ID), {
        talk: MAPHUBS_CONFIG.CORAL_TALK_HOST
      })
    }
  }

  render () {
    return (
      <div>
        <div id={MAPHUBS_CONFIG.CORAL_TALK_ID} />
      </div>
    )
  }
}
