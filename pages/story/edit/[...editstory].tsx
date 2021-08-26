import React from 'react'
import { useRouter } from 'next/router'
import Layout from '../../../src/components/Layout'
import StoryEditor from '../../../src/components/Story/StoryEditor'
import ErrorBoundary from '../../../src/components/ErrorBoundary'
import useT from '../../../src/hooks/useT'
import { Map } from '../../../src/types/map'
import { Story } from '../../../src/types/story'
import useSWR from 'swr'
import useStickyResult from '../../../src/hooks/useStickyResult'
import { Group } from '../../../src/types/group'

const EditStory = (): JSX.Element => {
  const router = useRouter()
  const { t } = useT()

  const slug = router.query.editstory || []
  const id = slug[0]

  const { data } = useSWR([
    `
    {
      story(id: "{id}") {
        story_id
        title
        body
        author
        owned_by_group_id
        groupname
        published_at
      }
      recentMaps(limit: 25) {
        map_id
        title
        share_id
        owned_by_group_id
      }
      myMaps {
        map_id
        title
        share_id
        owned_by_group_id
      }
      userGroups {
        group_id
        name
      }
      allowedToModifyStory(id: "{id}")
    }
    `,
    id
  ])
  const stickyData: {
    story: Story
    myMaps: Map[]
    recentMaps: Map[]
    allowedToModifyStory: boolean
    userGroups: Group[]
  } = useStickyResult(data) || {}
  const { story, myMaps, recentMaps, userGroups, allowedToModifyStory } =
    stickyData
  // TODO: initial redux state
  // dispatch story to redux store

  const title = story.title ? t(story.title) : 'New Story'

  if (story.owned_by_group_id && !allowedToModifyStory) {
    return (
      <ErrorBoundary t={t}>
        <Layout>
          <h1>{t('Error')}</h1>
          <p>{t('You do not have permission to modify this story')}</p>
        </Layout>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary t={t}>
      <Layout title={title} hideFooter>
        <div
          style={{
            height: 'calc(100% - 50px)'
          }}
        >
          <StoryEditor
            myMaps={myMaps}
            recentMaps={recentMaps}
            groups={userGroups}
          />
        </div>
      </Layout>
    </ErrorBoundary>
  )
}
export default EditStory
