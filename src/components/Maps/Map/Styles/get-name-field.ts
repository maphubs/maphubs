import MapStyles from '../Styles'
import _find from 'lodash.find'
export default {
  possibleNameFields: ['name', 'nom', 'nombre', 'nome'],

  getNameFieldFromPresets(presets: Array<Record<string, any>>): any | void {
    const nameFieldPreset = _find(presets, {
      isName: true
    })

    let nameField

    if (nameFieldPreset) {
      nameField = nameFieldPreset.tag
    }

    return nameField
  },

  guessNameFieldFromProps(properties: Record<string, any>): void {
    let nameField

    for (const key of Object.keys(properties)) {
      const lowercaseKey = key.toLowerCase()

      if (!nameField) {
        for (const name of this.possibleNameFields) {
          if (lowercaseKey.includes(name)) {
            nameField = key
          }
        }
      }
    }
    return nameField
  },

  getPresetsFromStyle(style?: mapboxgl.Style): any | void {
    if (style) {
      const firstSource = Object.keys(style.sources)[0]

      if (firstSource) {
        return MapStyles.settings.getSourceSetting(
          style,
          firstSource,
          'presets'
        )
      }
    }
  },

  getNameField(
    properties: Record<string, any>,
    presets?: Array<Record<string, any>>
  ): string {
    let nameField

    if (presets) {
      nameField = this.getNameFieldFromPresets(presets)
    }

    if (!nameField) {
      nameField = this.guessNameFieldFromProps(properties)
    }

    return nameField
  },

  getDescriptionFieldFromPresets(
    presets: Array<Record<string, any>>
  ): any | void {
    const descriptionFieldPreset = _find(presets, {
      isDescription: true
    })

    let descriptionField

    if (descriptionFieldPreset) {
      descriptionField = descriptionFieldPreset.tag
    }

    return descriptionField
  },

  getDescriptionField(
    properties: Record<string, any>,
    presets?: Array<Record<string, any>>
  ): void {
    let descriptionField

    if (presets) {
      descriptionField = this.getDescriptionFieldFromPresets(presets)
    }

    return descriptionField
  }
}
