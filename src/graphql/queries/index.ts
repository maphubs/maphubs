import groups from './groups'
import layers from './layers'
import maps from './maps'
import config from './config'

const queries = {}
Object.assign(queries, groups, layers, maps, config)
export default queries
