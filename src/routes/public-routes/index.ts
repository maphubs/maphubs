import layerExports from './layer-exports'
import publicMaps from './public-maps'
import screenshots from './screenshots'
import user from './user'
import healthcheck from './healthcheck'
import layerTilejson from './layer-tilejson'
import quick404 from './quick-404'
import sitemap from './sitemap'

export default function (app: any): void {
  layerExports(app)
  publicMaps(app)
  screenshots(app)
  user(app)
  healthcheck(app)
  layerTilejson(app)
  quick404(app)
  sitemap(app)
}
