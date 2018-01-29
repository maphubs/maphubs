// @flow
import React from 'react'

export default class Comments extends React.PureComponent<void, void> {
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
