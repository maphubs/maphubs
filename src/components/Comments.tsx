import React, { useEffect } from 'react'
import { useSession } from 'next-auth/client'

const Comments = ({ coral_jwt }: { coral_jwt?: string }): JSX.Element => {
  const [session, loading] = useSession()

  useEffect(() => {
    // eslint-disable-next-line no-undef
    if (Coral) {
      // eslint-disable-next-line no-undef
      Coral.createStreamEmbed({
        accessToken: coral_jwt,
        id: 'coral-comments',
        autoRender: true,
        rootURL: process.env.NEXT_PUBLIC_CORAL_TALK_HOST // Uncomment these lines and replace with the ID of the
        // story's ID and URL from your CMS to provide the
        // tightest integration. Refer to our documentation at
        // https://docs.coralproject.net for all the configuration
        // options.
        // storyID: '${storyID}',
        // storyURL: '${storyURL}',
      })
    }
  }, [coral_jwt])

  return (
    <div
      style={{
        width: '100%'
      }}
      id='coral-comments'
    />
  )
}
export default Comments
