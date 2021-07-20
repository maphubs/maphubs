import LayerModel from '../../models/layer'
import FeatureModel from '../../models/feature'
import PhotoAttachmentModel from '../../models/photo-attachment'
import { Context } from '../../types/graphqlContext'
import { FeatureInfo } from '../../types/feature'

export default {
  async featureInfo(
    _: unknown,
    args: { layer_id: number; mhid: string },
    context: Context
  ): Promise<FeatureInfo> {
    const { user } = context
    const layer = await LayerModel.getLayerByID(args.layer_id)

    if (layer) {
      const canEdit = await LayerModel.allowedToModify(layer.layer_id, user.sub)
      const geoJSON = await FeatureModel.getGeoJSON(args.mhid, layer.layer_id)
      const notes = await FeatureModel.getFeatureNotes(
        args.mhid,
        layer.layer_id
      )
      if (geoJSON) {
        const photos = await PhotoAttachmentModel.getPhotosForFeature(
          args.layer_id,
          args.mhid
        )
        let photo

        if (photos && Array.isArray(photos)) {
          photo = photos[0]
        }

        let featureName = 'Feature'

        if (geoJSON.features.length > 0 && geoJSON.features[0].properties) {
          const geoJSONProps = geoJSON.features[0].properties

          if (geoJSONProps.name) {
            featureName = geoJSONProps.name
          }

          geoJSONProps.layer_id = layer.layer_id
          geoJSONProps.mhid = args.mhid
        }

        return {
          feature: {
            name: featureName,
            type: geoJSON.type,
            features: geoJSON.features,
            layer_id: layer.layer_id,
            bbox: geoJSON.bbox,
            mhid: args.mhid
          },
          notes,
          photo,
          layer,
          canEdit
        }
      } else {
        throw new Error('Failed to load feature GeoJSON')
      }
    } else {
      throw new Error(`Layer ${args.layer_id} not found`)
    }
  }
}
