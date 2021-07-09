import { LocalizedString } from '../types/LocalizedString'

// @flow

type SupportedLocale = {
  label: string
  name: string
  value: string
}
const supported: SupportedLocale[] = [
  {
    label: 'EN',
    name: 'English',
    value: 'en'
  },
  {
    label: 'ES',
    name: 'Español',
    value: 'es'
  },
  {
    label: 'FR',
    name: 'Français',
    value: 'fr'
  },
  {
    label: 'ID',
    name: 'Bahasa Indonesia',
    value: 'id'
  },
  {
    label: 'IT',
    name: 'Italiano',
    value: 'it'
  },
  {
    label: 'PT',
    name: 'Português',
    value: 'pt'
  }
]

export default {
  getSupported(): SupportedLocale[] {
    return supported
  },
  getConfig(code: string): SupportedLocale {
    let config = { value: 'UNK', label: 'UNK', name: 'UNKNOWN' }
    for (const l of this.getSupported()) {
      if (l.value === code) {
        config = l
      }
    }
    return config
  },
  getEmptyLocalizedString(): LocalizedString {
    const localizedString: LocalizedString = {}
    for (const l of supported) {
      localizedString[l.value] = ''
    }
    return localizedString
  }
}
