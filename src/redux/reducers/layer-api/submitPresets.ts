import slugify from 'slugify'
import { LayerState } from '../layerSlice'

export const submitPresets = async (
  presets: LayerState['presets'],
  style: LayerState['style'],
  layer_id: number,
  create: boolean
): Promise<Record<string, unknown>> => {
  if (presets) {
    // build tags (aka attribute name) by slugifying the label entered
    for (const preset of presets) {
      if (!preset.tag) {
        let label

        if (preset.label.en) {
          // tags default to english if present
          label = preset.label.en
        } else {
          // otherwise set to first populated value in Localized String object
          for (const val of Object.values(preset.label)) {
            if (!label && val) label = val
          }
        }

        let tag = slugify(label)
        tag = tag.toLowerCase()
        preset.tag = tag
      }
    }

    const response = await fetch('/api/layer/presets/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        layer_id,
        presets,
        style, // presets also stored in style
        create
      })
    })
    const result = await response.json()
    if (result.success) {
      return presets
    } else {
      throw new Error(result.message || 'Server Error')
    }
  }
}
