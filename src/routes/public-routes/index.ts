import layerExports from './layer-exports'
import publicMaps from './public-maps'
import screenshots from './screenshots'
import user from './user'
import layerTilejson from './layer-tilejson'
import sitemap from './sitemap'

export default function (app: any): void {
  layerExports(app)
  publicMaps(app)
  screenshots(app)
  user(app)
  layerTilejson(app)
  sitemap(app)
}
