import React, { useEffect } from 'react'
import { useSession } from 'next-auth/client'

const Comments = (): JSX.Element => {
  const [session, loading] = useSession()

  let user
  if (!loading) {
    user = session.user
  }

  useEffect(() => {
    // eslint-disable-next-line no-undef
    if (Coral && user) {
      // eslint-disable-next-line no-undef
      Coral.createStreamEmbed({
        accessToken: user.coral_jwt,
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
  }, [user])

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
