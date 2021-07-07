import admin from './admin'
import groupViews from './groups-views'
import layerMetricApi from './layer-metric-api'
import layersReplace from './layers-replace'
import pages from './pages'
import storiesViews from './stories-views'
import auth from './auth'
import home from './home'
import layerUpload from './layer-upload'
import layersViews from './layers-views'
import proxy from './proxy'
import user from './user'
import customErrors from './custom-errors'
import images from './images'
import layersApiPublic from './layers-api-public'
import mapApiPublic from './map-api-public'
import screenshots from './screenshots'
import exportRoutes from './exports'
import layersApi from './layers-api'
import mapApi from './map-api'
import features from './features'
import isochroneService from './isochrone-service'
import layersImport from './layers-import'
import mapViews from './map-views'
import search from './search'
import groupsApi from './groups-api'
import layerData from './layer-data'
import layersRemote from './layers-remote'
import oembed from './oembed'
import storiesApi from './stories-api'

export default function (app: any): void {
  admin(app)
  groupViews(app)
  layerMetricApi(app)
  layersReplace(app)
  pages(app)
  storiesViews(app)
  auth(app)
  home(app)
  layerUpload(app)
  layersViews(app)
  proxy(app)
  user(app)
  customErrors(app)
  images(app)
  layersApiPublic(app)
  mapApiPublic(app)
  screenshots(app)
  exportRoutes(app)
  layersApi(app)
  mapApi(app)
  features(app)
  isochroneService(app)
  layersImport(app)
  mapViews(app)
  search(app)
  groupsApi(app)
  layerData(app)
  layersRemote(app)
  oembed(app)
  storiesApi(app)
}
