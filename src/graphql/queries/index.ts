import groups from './groups'
import layers from './layers'
import maps from './maps'
import stories from './stories'
import config from './config'

const queries = {}
Object.assign(queries, groups, layers, maps, stories, config)
export default queries
