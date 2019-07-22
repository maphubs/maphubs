// @flow
import { Container } from 'unstated'
import request from 'superagent'

export type Story ={
  title?: string,
  author?: string,
  body?: string,
  story_id?: number,
  published?: boolean,
  publishedDate?: string,
  owned_by_group_id?: string,
  tags?: Array<string>
}

type StoryContainerState = {
  modified?: boolean,
  _csrf: string
} & Story

export default class StoryContainer extends Container<StoryContainerState> {
  constructor (initialState: any) {
    super()
    const defaultState = {
      title: '',
      author: '',
      body: '',
      modified: false
    }
    this.state = Object.assign(defaultState, initialState)
  }
  bodyChange = (body: string) => {
    this.setState({body, modified: true})
  }

  titleChange = (title: string) => {
    this.setState({title, modified: true})
  }

  publishDateChange = (date: Object) => {
    this.setState({publishedDate: date.format('YYYY-MM-DD'), modified: true})
  }

  togglePublished = (published: boolean) => {
    this.setState({published, modified: true})
  }

  authorChange = (author: string) => {
    this.setState({author, modified: true})
  }

  groupChange = (owned_by_group_id: string) => {
    this.setState({owned_by_group_id, modified: true})
  }

  tagsChange = (tags: Array<string>) => {
    this.setState({tags, modified: true})
  }

  save = async (firstline: string, firstimage: any) => {
    const { body, title, author, published, publishDate, tags, _csrf } = this.state

    const response = await request.post('/api/story/save')
      .type('json').accept('json')
      .send({
        body,
        title,
        author,
        published,
        publishDate,
        tags,
        firstline,
        firstimage,
        _csrf
      })

    if (response.body && response.success) {
      this.setState({story_id: response.body.story_id, modified: false})
    }
  }

  addImage = async (data: string, info: Object) => {
    const { story_id, _csrf } = this.state
    return request.post('/api/story/addimage')
      .type('json').accept('json')
      .send({
        story_id,
        image: data,
        info,
        _csrf
      })
  }

  delete = async () => {
    return request.post('/api/story/delete')
      .type('json').accept('json')
      .send({story_id: this.state.story_id, _csrf: this.state._csrf})
  }
}
