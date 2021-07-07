import locales from '../locales'
import localeUtil from '../locales/util'
import { LocalizedString } from '../types/LocalizedString'
const i18n = null
/*
if (process.env.APP_ENV !== 'browser') {
  i18n = require('../i18n')
}
*/

export default {
  en: locales.en,
  fr: locales.fr,
  es: locales.es,
  it: locales.it,
  id: locales.id,
  pt: locales.pt,

  getLocaleString(locale: string, text: string): string {
    if (i18n) {
      // use i18n package when running on the server
      i18n.setLocale(locale)
      return i18n.__(text)
    } else {
      return locales.getLocaleString(locale, text)
    }
  },

  formModelToLocalizedString(model, name): LocalizedString {
    const result = localeUtil.getEmptyLocalizedString()
    for (const key of Object.keys(result)) {
      if (model[`${name}-${key}`]) {
        result[key] = model[`${name}-${key}`]
      }
    }
    return result
  },

  getFirstNonEmptyString(localizedString: LocalizedString): string {
    let result = ''
    for (const key of Object.keys(localizedString)) {
      const val = localizedString[key]
      if (val) result = val
    }
    return result
  },

  getLocaleStringObject(
    locale: string,
    localizedString: LocalizedString
  ): string | null {
    // recover if given an undefined localizedString
    if (!localizedString) {
      return
    }

    // recover if we somehow end up with a plain string
    if (typeof localizedString === 'string') {
      return localizedString
    }

    if (locale) {
      if (localizedString[locale]) {
        // found the requested locale
        return localizedString[locale]
      } else {
        return localizedString.en
          ? localizedString.en
          : this.getFirstNonEmptyString(localizedString)
      }
    } else {
      return localizedString.en
        ? localizedString.en
        : this.getFirstNonEmptyString(localizedString)
    }
  }
}
