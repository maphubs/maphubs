import { Container } from 'unstated'
import request from 'superagent'
import moment from 'moment'
export type Story = {
  title?: Record<string, any>
  author?: Record<string, any>
  body?: Record<string, any>
  summary?: Record<string, any>
  story_id?: number
  published?: boolean
  published_at?: string
  owned_by_group_id?: string
  tags?: Array<string>
}
type StoryContainerState = {
  modified?: boolean
  canChangeGroup: boolean
} & Story
export default class StoryContainer extends Container<StoryContainerState> {
  constructor(initialState: any) {
    super()
    const defaultState = {
      title: '',
      author: '',
      body: '',
      modified: false,
      canChangeGroup: !initialState.owned_by_group_id
    }
    this.state = Object.assign(defaultState, initialState)

    // must be done after the .assign since published_at=null is sent from the server
    if (!this.state.published_at) {
      this.state.published_at = moment().startOf('day').format()
    }
  }

  bodyChange: (lang: string, update: string) => void = (
    lang: string,
    update: string
  ) => {
    this.setState((state) => {
      const body = state.body || {}
      body[lang] = update
      return {
        body,
        modified: true
      }
    })
  }
  titleChange: (title: any) => void = (title: Record<string, any>) => {
    this.setState({
      title,
      modified: true
    })
  }
  publishDateChange: (date: any) => void = (date: Record<string, any>) => {
    this.setState({
      published_at: date.format(),
      modified: true
    })
  }
  togglePublished: (published: boolean) => void = (published: boolean) => {
    this.setState({
      published,
      modified: true
    })
  }
  authorChange: (author: any) => void = (author: Record<string, any>) => {
    this.setState({
      author,
      modified: true
    })
  }
  summaryChange: (summary: any) => void = (summary: Record<string, any>) => {
    this.setState({
      summary,
      modified: true
    })
  }
  groupChange: (owned_by_group_id: string) => void = (
    owned_by_group_id: string
  ) => {
    this.setState({
      owned_by_group_id,
      modified: true
    })
  }
  tagsChange: (tags: Array<string>) => void = (tags: Array<string>) => {
    this.setState({
      tags,
      modified: true
    })
  }
  setModified: (modified: boolean) => void = (modified: boolean) => {
    this.setState({
      modified
    })
  }
  save: (firstimage: any) => Promise<any> = async (firstimage: any) => {
    const {
      story_id,
      owned_by_group_id,
      body,
      title,
      author,
      summary,
      published,
      published_at,
      tags
    } = this.state
    return request.post('/api/story/save').type('json').accept('json').send({
      story_id,
      owned_by_group_id,
      body,
      title,
      author,
      summary,
      published,
      published_at,
      tags,
      firstimage
    })
  }
  delete: () => Promise<any> = async () => {
    return request.post('/api/story/delete').type('json').accept('json').send({
      story_id: this.state.story_id
    })
  }
}
