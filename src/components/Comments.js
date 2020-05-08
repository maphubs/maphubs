// @flow
import React from 'react'
import UserStore from '../stores/UserStore'
import MapHubsComponent from './MapHubsComponent'
import type {UserStoreState} from '../stores/UserStore'
import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig

type Props = {
  id: string
}

export default class Comments extends MapHubsComponent<Props, UserStoreState> {
  static defaultProps = {
    id: 'coral-comments'
  }

  constructor (props: Props) {
    super(props)
    this.stores.push(UserStore)
  }

  componentDidMount () {
    // eslint-disable-next-line no-undef
    if (Coral) {
      // eslint-disable-next-line no-undef
      Coral.createStreamEmbed({
        accessToken: this.state.user?.coral_jwt,
        id: this.props.id,
        autoRender: true,
        rootURL: MAPHUBS_CONFIG.CORAL_TALK_HOST
        // Uncomment these lines and replace with the ID of the
        // story's ID and URL from your CMS to provide the
        // tightest integration. Refer to our documentation at
        // https://docs.coralproject.net for all the configuration
        // options.
        // storyID: '${storyID}',
        // storyURL: '${storyURL}',
      })
    }
  }

  render () {
    return (
      <div style={{width: '100%'}} id={this.props.id} />
    )
  }
}
