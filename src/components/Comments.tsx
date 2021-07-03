import React from 'react'
import UserStore from '../stores/UserStore'

import type { UserStoreState } from '../stores/UserStore'
import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig
type Props = {
  id: string
}
export default class Comments extends React.Component<Props, UserStoreState> {
  static defaultProps:
    | any
    | {
        id: string
      } = {
    id: 'coral-comments'
  }
  stores: any
  constructor(props: Props) {
    super(props)
    this.stores = [UserStore]
  }

  componentDidMount(): void {
    // eslint-disable-next-line no-undef
    if (Coral) {
      // eslint-disable-next-line no-undef
      Coral.createStreamEmbed({
        accessToken: this.state.user?.coral_jwt,
        id: this.props.id,
        autoRender: true,
        rootURL: MAPHUBS_CONFIG.CORAL_TALK_HOST // Uncomment these lines and replace with the ID of the
        // story's ID and URL from your CMS to provide the
        // tightest integration. Refer to our documentation at
        // https://docs.coralproject.net for all the configuration
        // options.
        // storyID: '${storyID}',
        // storyURL: '${storyURL}',
      })
    }
  }

  render(): JSX.Element {
    return (
      <div
        style={{
          width: '100%'
        }}
        id={this.props.id}
      />
    )
  }
}
