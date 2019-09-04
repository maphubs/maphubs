// @flow
import { Container } from 'unstated'
import request from 'superagent'

export type Story ={
  title?: Object,
  author?: Object,
  body?: Object,
  summary?: Object,
  story_id?: number,
  published?: boolean,
  published_at?: string,
  owned_by_group_id?: string,
  tags?: Array<string>
}

type StoryContainerState = {
  modified?: boolean,
  _csrf: string,
  canChangeGroup: boolean
} & Story

export default class StoryContainer extends Container<StoryContainerState> {
  constructor (initialState: any) {
    super()
    const defaultState = {
      title: '',
      author: '',
      body: '',
      modified: false,
      canChangeGroup: !initialState.owned_by_group_id
    }
    this.state = Object.assign(defaultState, initialState)
  }

  bodyChange = (lang:string, update: string) => {
    this.setState(state => {
      const body = state.body || {}
      body[lang] = update
      return { body, modified: true }
    })
  }

  titleChange = (title: Object) => {
    this.setState({title, modified: true})
  }

  publishDateChange = (date: Object) => {
    this.setState({published_at: date.format('YYYY-MM-DD'), modified: true})
  }

  togglePublished = (published: boolean) => {
    this.setState({published, modified: true})
  }

  authorChange = (author: Object) => {
    this.setState({author, modified: true})
  }

  summaryChange = (summary: Object) => {
    this.setState({summary, modified: true})
  }

  groupChange = (owned_by_group_id: string) => {
    this.setState({owned_by_group_id, modified: true})
  }

  tagsChange = (tags: Array<string>) => {
    this.setState({tags, modified: true})
  }

  setModified = (modified: boolean) => {
    this.setState({modified})
  }

  save = async (firstimage: any) => {
    const { story_id, owned_by_group_id, body, title, author, summary, published, published_at, tags, _csrf } = this.state

    return request.post('/api/story/save')
      .type('json').accept('json')
      .send({
        story_id,
        owned_by_group_id,
        body,
        title,
        author,
        summary,
        published,
        published_at,
        tags,
        firstimage,
        _csrf
      })
  }

  delete = async () => {
    return request.post('/api/story/delete')
      .type('json').accept('json')
      .send({story_id: this.state.story_id, _csrf: this.state._csrf})
  }
}
